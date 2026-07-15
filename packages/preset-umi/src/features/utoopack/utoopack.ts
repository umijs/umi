import { checkVersion } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi, webpack } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
  extractEntryPointFilesFromStats,
} from '../../utils/extractEntryAssets';

function cleanVersionRange(version?: string) {
  return version?.replace(/^[^\d]*/, '');
}

export function getPackVersionFromBundler(bundlerEntry: string) {
  const resolvePaths = [dirname(bundlerEntry), bundlerEntry];

  for (const resolvePath of resolvePaths) {
    try {
      const pkgPath = require.resolve('@utoo/pack/package.json', {
        paths: [resolvePath],
      });
      const pkg = require(pkgPath);
      if (pkg.version) {
        return pkg.version;
      }
    } catch {}
  }

  const packageJsonCandidates = [
    join(dirname(bundlerEntry), '../package.json'),
    join(bundlerEntry, '../package.json'),
    join(bundlerEntry, 'package.json'),
  ];

  for (const packageJsonPath of packageJsonCandidates) {
    try {
      const pkg = require(packageJsonPath);
      return cleanVersionRange(pkg.dependencies?.['@utoo/pack']);
    } catch {}
  }

  return undefined;
}

export default (api: IApi) => {
  api.describe({
    key: 'utoopack',
    config: {
      schema({ zod }) {
        return zod.union([
          zod.boolean(),
          zod
            .object({
              root: zod.string(),
              watch: zod
                .object({
                  pollIntervalMs: zod.number(),
                  ignored: zod.array(zod.string()),
                  nodeModulesRegexes: zod.array(zod.string()),
                })
                .partial(),
            })
            .partial(),
        ]);
      },
    },
    enableBy: () =>
      Boolean(api.userConfig.utoopack) || Boolean(process.env.FORCE_UTOOPACK),
  });

  api.onCheck(() => {
    // utoopack 仅支持 node 20+
    checkVersion(20, `Node 20 is required when using utoopack.`);
  });

  // html 处理逻辑
  const assets: EntryAssets = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  api.modifyAppData((memo) => {
    memo.bundler = 'utoopack';

    return memo;
  });

  api.modifyConfig((memo) => {
    // Only modify config if utoopack is explicitly enabled in userConfig
    if (!api.userConfig.utoopack) {
      return memo;
    }

    return {
      ...memo,
      mfsu: false,
      hmrGuardian: false,
      utoopack: {
        ...memo.utoopack,
      },
    };
  });

  api.onStart(() => {
    const bundlerEntry =
      process.env.UTOOPACK || require.resolve('@umijs/bundler-utoopack');

    process.env.UTOOPACK = bundlerEntry;

    const packVersion = getPackVersionFromBundler(bundlerEntry);
    if (packVersion) {
      process.env.UTOOPACK_VERSION = packVersion;
    } else {
      delete process.env.UTOOPACK_VERSION;
    }
  });

  api.onDevCompileDone(({ stats }: { stats: webpack.StatsCompilation }) => {
    const entryAssets = extractEntryAssets(
      extractEntryPointFilesFromStats(stats),
    );
    Object.entries(entryAssets).forEach(([ext, files]) => {
      if (!Array.isArray(assets[ext])) {
        assets[ext] = [];
      }
      assets[ext].push(...files);
    });
  });

  api.onBuildComplete(({ stats }: { stats: webpack.StatsCompilation }) => {
    const entryAssets = extractEntryAssets(
      extractEntryPointFilesFromStats(stats),
    );
    Object.entries(entryAssets).forEach(([ext, files]) => {
      if (!Array.isArray(assets[ext])) {
        assets[ext] = [];
      }
      assets[ext].push(...files);
    });
  });

  api.addHTMLStyles(() => {
    const { publicPath } = api.config;
    const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;
    return assets.css.map((css) => {
      return { src: `${displayPublicPath}${css}` };
    });
  });

  api.addHTMLHeadScripts(() => {
    const { publicPath } = api.config;
    const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

    return assets.js.map((js) => {
      return { src: `${displayPublicPath}${js}` };
    });
  });
};
