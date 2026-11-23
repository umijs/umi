import { fsExtra, winPath } from '@umijs/utils';
import { forEach, groupBy } from '@umijs/utils/compiled/lodash';
import { createHash } from 'crypto';
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  openSync,
  readdirSync,
  readSync,
  realpathSync,
  type Stats,
  writeFileSync,
} from 'fs';
import { basename, extname, isAbsolute, join, relative, sep } from 'path';
import { IApi } from '../../types';
/** esbuild plugin for resolving umi imports */
export function esbuildUmiPlugin(api: IApi) {
  return {
    name: 'umi',
    setup(build: any) {
      build.onResolve(
        { filter: /^(umi|@umijs\/max|@alipay\/bigfish)$/ },
        () => ({
          path: join(api.paths.absTmpPath, 'exports.ts'),
        }),
      );
    },
  };
}

export function absServerBuildPath(api: IApi) {
  if (api.env === 'development') {
    return join(api.paths.absTmpPath, 'server/umi.server.js');
  }
  const manifestPath = join(api.paths.cwd, 'server', 'build-manifest.json');
  if (api.userConfig.ssr.serverBuildPath || !existsSync(manifestPath)) {
    return join(
      api.paths.cwd,
      api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
    );
  }

  // server output path will not be removed before compile
  // so remove require cache to avoid outdated asset path when enable hash
  delete require.cache[manifestPath];
  const manifest = require(manifestPath);
  // basename use to strip public path
  // ex. /foo/umi.xxx.js -> umi.xxx.js
  return join(api.paths.cwd, 'server', basename(manifest.assets['umi.js']));
}

export const generateBuildManifest = (api: IApi) => {
  const publicPath = api.userConfig.publicPath || '/';
  const manifestFileName =
    api.config.manifest?.fileName || 'asset-manifest.json';
  const finalJsonObj: any = {};
  const assetFilePath = join(api.paths.absOutputPath, manifestFileName);
  const buildFilePath = join(api.paths.absOutputPath, 'build-manifest.json');
  const json = existsSync(assetFilePath)
    ? fsExtra.readJSONSync(assetFilePath)
    : {};
  forEach(json, (path, key) => {
    json[key] = `${publicPath}${path}`;
  });
  finalJsonObj.assets = json;
  writeFileSync(buildFilePath, JSON.stringify(finalJsonObj, null, 2), {
    flag: 'w',
  });
};

function addPublicPath(publicPath: string, file: string) {
  if (/^(?:https?:)?\/\//.test(file) || file.startsWith('/')) {
    return file;
  }
  if (publicPath === 'auto') {
    return `/${file}`;
  }
  return `${publicPath.replace(/\/?$/, '/')}${file}`;
}

const assetExts = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp3',
  '.mp4',
]);

function getOriginalAssetName(file: string) {
  const ext = extname(file);
  return `${basename(file, ext).replace(/\.[a-f0-9]{8,}$/i, '')}${ext}`;
}

function walkSourceAssets(dir: string, ret: string[] = []) {
  if (!existsSync(dir)) return ret;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        [
          'node_modules',
          'dist',
          'server',
          '.umi',
          '.umi-production',
          '.turbopack',
        ].includes(entry.name)
      ) {
        continue;
      }
      walkSourceAssets(absPath, ret);
    } else if (assetExts.has(extname(entry.name))) {
      ret.push(absPath);
    }
  }
  return ret;
}

function isCssFile(file: string) {
  return /\.css(?:[?#].*)?$/.test(file) && !/\.css\.map(?:[?#].*)?$/.test(file);
}

function isUmiCssFile(file: string) {
  return /^umi(?:\.[a-f0-9]+)?\.css$/i.test(basename(file.split(/[?#]/)[0]));
}

function isUtoopackSingleCss(file: string) {
  return /\.single\.css(?:[?#].*)?$/.test(file);
}

function findClientCssFiles(files: string[]) {
  const cssFiles = files.filter(isCssFile);

  return Array.from(
    new Set([
      ...cssFiles.filter(isUmiCssFile),
      ...cssFiles.filter((file) => !isUmiCssFile(file)),
    ]),
  ).filter((file) => !isUtoopackSingleCss(file));
}

interface AssetFile {
  path: string;
  stat: Stats;
}

function isWithinAssetRoot(root: string, file: string) {
  const fromRoot = relative(root, file);
  return (
    !isAbsolute(fromRoot) &&
    fromRoot !== '..' &&
    !fromRoot.startsWith(`..${sep}`)
  );
}

function getRegularAssetFile(
  root: string,
  file: string,
): AssetFile | undefined {
  if (!isWithinAssetRoot(root, file)) return;
  try {
    const path = realpathSync(file);
    if (!isWithinAssetRoot(root, path)) return;
    const stat = lstatSync(path);
    if (stat.isFile()) return { path, stat };
  } catch {
    // Missing or inaccessible paths cannot participate in asset matching.
  }
}

function hashAssetFile(
  { path, stat }: AssetFile,
  buffer: Buffer,
): string | null {
  try {
    const fd = openSync(
      path,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_NONBLOCK ?? 0),
    );
    try {
      // Check the opened file in case the path changed after resolution.
      const opened = fstatSync(fd);
      if (
        !opened.isFile() ||
        opened.dev !== stat.dev ||
        opened.ino !== stat.ino ||
        opened.size !== stat.size
      ) {
        return null;
      }

      const hash = createHash('sha256');
      let remaining = opened.size;
      while (remaining > 0) {
        const bytesRead = readSync(
          fd,
          buffer,
          0,
          Math.min(remaining, buffer.length),
          null,
        );
        if (!bytesRead) return null;
        hash.update(buffer.subarray(0, bytesRead));
        remaining -= bytesRead;
      }
      return hash.digest('hex');
    } finally {
      closeSync(fd);
    }
  } catch {
    return null;
  }
}

function getSourceAssetMap(
  api: IApi,
  statsAssets: string[],
  publicPath: string,
) {
  let outputRoot: string;
  let sourceRoot: string;
  try {
    outputRoot = realpathSync(api.paths.absOutputPath);
    sourceRoot = realpathSync(api.cwd);
  } catch {
    return {};
  }

  const outputAssets = statsAssets.flatMap((file) => {
    if (!assetExts.has(extname(file))) return [];
    const asset = getRegularAssetFile(outputRoot, join(outputRoot, file));
    return asset ? [{ ...asset, file, name: getOriginalAssetName(file) }] : [];
  });
  if (!outputAssets.length) return {};

  const assetsByName = groupBy(outputAssets, (asset) => asset.name);
  const sourcesByName = groupBy(walkSourceAssets(sourceRoot), (file) =>
    basename(file),
  );
  const hashes = new Map<string, string | null>();
  const buffer = Buffer.alloc(64 * 1024);

  function getHash(file: AssetFile) {
    let hash = hashes.get(file.path);
    if (hash === undefined) {
      hash = hashAssetFile(file, buffer);
      hashes.set(file.path, hash);
    }
    return hash;
  }

  const mapping: Record<string, string> = {};
  for (const [name, sources] of Object.entries(sourcesByName)) {
    const assets = assetsByName[name];
    if (!assets) continue;
    for (const file of sources) {
      const source = getRegularAssetFile(sourceRoot, file);
      if (!source) continue;
      const matched = assets.find((asset) => {
        if (asset.stat.size !== source.stat.size) return false;
        if (sources.length === 1 && assets.length === 1) return true;
        const hash = getHash(source);
        return hash !== null && hash === getHash(asset);
      });
      if (matched) {
        mapping[winPath(relative(sourceRoot, file))] = addPublicPath(
          publicPath,
          matched.file,
        );
      }
    }
  }
  return mapping;
}

export const generateBuildManifestFromStats = (api: IApi, stats: any) => {
  const publicPath = api.userConfig.publicPath || '/';
  const buildFilePath = join(api.paths.absOutputPath, 'build-manifest.json');
  const statsJson = stats?.toJson ? stats.toJson() : stats || {};
  const entrypoint = statsJson.entrypoints?.umi;
  const entryFiles = new Set<string>();

  for (const asset of entrypoint?.assets || []) {
    entryFiles.add(typeof asset === 'string' ? asset : asset.name);
  }

  for (const chunkId of entrypoint?.chunks || []) {
    const chunk = (statsJson.chunks || []).find((item: any) => {
      return item?.id === chunkId || item?.names?.includes?.(chunkId);
    });
    for (const file of chunk?.files || []) {
      entryFiles.add(file);
    }
  }

  const statsAssets = (statsJson.assets || [])
    .map((asset: any) => (typeof asset === 'string' ? asset : asset.name))
    .filter(Boolean);
  const files = Array.from(new Set([...entryFiles, ...statsAssets])).filter(
    Boolean,
  );
  const jsFiles = files.filter((file) => /\.m?js$/.test(file));
  const umiJs =
    jsFiles.find((file) => /^umi(?:\.[a-f0-9]+)?\.js$/i.test(basename(file))) ||
    jsFiles[0];
  const finalJsonObj: any = {
    assets: {
      ...files.reduce((memo, file) => {
        memo[file] = addPublicPath(publicPath, file);
        return memo;
      }, {} as Record<string, string>),
      ...getSourceAssetMap(api, statsAssets, publicPath),
    },
  };

  if (umiJs) {
    finalJsonObj.assets['umi.js'] = addPublicPath(publicPath, umiJs);
  }

  const umiCssFiles = findClientCssFiles([...entryFiles, ...statsAssets]);
  if (umiCssFiles.length) {
    finalJsonObj.assets['umi.css'] = umiCssFiles.map((file) =>
      addPublicPath(publicPath, file),
    );
  }

  writeFileSync(buildFilePath, JSON.stringify(finalJsonObj, null, 2), {
    flag: 'w',
  });
};
