import { fsExtra, winPath } from '@umijs/utils';
import { forEach, groupBy } from '@umijs/utils/compiled/lodash';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, extname, join, relative } from 'path';
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

function walkSourceAssets(dir: string, cwd: string, ret: string[] = []) {
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
      walkSourceAssets(absPath, cwd, ret);
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

function getSourceAssetMap(
  api: IApi,
  statsAssets: string[],
  publicPath: string,
) {
  const outputAssets = statsAssets
    .filter((file) => assetExts.has(extname(file)))
    .map((file) => {
      const absPath = join(api.paths.absOutputPath, file);
      if (!existsSync(absPath)) return null;
      return {
        file,
        name: getOriginalAssetName(file),
        size: statSync(absPath).size,
      };
    })
    .filter(Boolean) as { file: string; name: string; size: number }[];

  const assetsByName = groupBy(outputAssets, (asset) => asset.name);
  const sourcesByName = groupBy(walkSourceAssets(api.cwd, api.cwd), (file) =>
    basename(file),
  );
  const mapping: Record<string, string> = {};
  for (const [name, sources] of Object.entries(sourcesByName)) {
    const assets = assetsByName[name];
    if (!assets) continue;
    for (const source of sources) {
      const size = statSync(source).size;
      let contents: Buffer | undefined;
      const matched = assets.find((asset) => {
        if (asset.size !== size) return false;
        if (sources.length === 1 && assets.length === 1) return true;
        contents ??= readFileSync(source);
        return contents.equals(
          readFileSync(join(api.paths.absOutputPath, asset.file)),
        );
      });
      if (matched) {
        mapping[winPath(relative(api.cwd, source))] = addPublicPath(
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
