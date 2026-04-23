import { checkVersion } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi, webpack } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
} from '../../utils/extractEntryAssets';

export function getPackVersionFromBundler(bundlerEntry: string) {
  const packageJsonCandidates = [
    join(dirname(bundlerEntry), '../package.json'),
    join(bundlerEntry, '../package.json'),
    join(bundlerEntry, 'package.json'),
  ];

  for (const packageJsonPath of packageJsonCandidates) {
    try {
      const pkg = require(packageJsonPath);
      return pkg.dependencies?.['@utoo/pack']?.replace(/^[^\d]*/, '');
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
    const entryPointFiles = new Set<string>();

    for (const chunk of stats.entrypoints?.['umi']?.chunks || []) {
      const files =
        (stats?.chunks || []).find((c) => c?.id === chunk)?.files || [];
      for (const file of files) {
        entryPointFiles.add(file);
      }
    }

    const entryAssets = extractEntryAssets(Array.from(entryPointFiles));
    Object.entries(entryAssets).forEach(([ext, files]) => {
      if (!Array.isArray(assets[ext])) {
        assets[ext] = [];
      }
      assets[ext].push(...files);
    });
  });

  api.onBuildComplete(({ stats }: { stats: webpack.StatsCompilation }) => {
    const entryPointFiles = new Set<string>();

    for (const chunk of stats.entrypoints?.['umi']?.chunks || []) {
      const files =
        (stats?.chunks || []).find((c) => c?.id === chunk)?.files || [];
      for (const file of files) {
        entryPointFiles.add(file);
      }
    }

    const entryAssets = extractEntryAssets(Array.from(entryPointFiles));
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
