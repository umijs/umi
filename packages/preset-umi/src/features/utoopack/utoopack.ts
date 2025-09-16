import { checkVersion } from '@umijs/utils';
import { join } from 'path';
import { IApi, webpack } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
} from '../../utils/extractEntryAssets';

export default (api: IApi) => {
  api.describe({
    key: 'utoopack',
    config: {
      schema({ zod }) {
        return zod.object({}).partial();
      },
    },
    enableBy: () => Boolean(api.userConfig.utoopack),
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
    process.env.UTOOPACK =
      process.env.UTOOPACK || require.resolve('@umijs/bundler-utoopack');
    try {
      const pkg = require(join(
        require.resolve(process.env.UTOOPACK),
        '../../package.json',
      ));
      api.logger.info(`Using @utoo/pack@${pkg.dependencies['@utoo/pack']}`);
    } catch (e) {
      console.error(e);
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

    // add globalThis.TURBOPACK_CHUNK_LISTS to enable hmr
    const allAssets = (stats.assets || []).map((asset) => asset.name);
    for (const asset of allAssets) {
      if (
        asset.endsWith('.js') &&
        !assets.js.includes(asset) &&
        !asset.includes('umi.js')
      ) {
        assets.js.push(asset);
      } else if (asset.endsWith('.css') && !assets.css.includes(asset)) {
        assets.css.push(asset);
      }
    }
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
      return `${displayPublicPath}${css}`;
    });
  });

  api.addHTMLHeadScripts(() => {
    const { publicPath } = api.config;
    const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

    return assets.js.map((js) => {
      return `${displayPublicPath}${js}`;
    });
  });
};
