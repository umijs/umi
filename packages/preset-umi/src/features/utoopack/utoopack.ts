import { join } from 'path';
import { IApi } from '../../types';
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
    enableBy: api.EnableBy.config,
  });

  // html 处理逻辑
  const assets: EntryAssets = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  api.modifyConfig((memo, args) => {
    let rootDir = join(args.paths.cwd, memo.rootDir).replace(/\/$/, '');
    memo.alias = {
      ...memo.alias,
      '@/*': `${args.paths.absSrcPath}/*`,
      '@@/*': `${args.paths.absTmpPath}/*`,
      [`${rootDir}/*`]: `${rootDir}/*`,
    };
    return memo;
  });

  api.onBuildComplete(({ stats }) => {
    const entryPointFiles = new Set<string>();

    for (const chunk of stats.entrypoints['umi']?.chunks || []) {
      const files = stats.chunks.find((c: any) => c.id === chunk).files;
      for (const file of files) {
        entryPointFiles.add(file);
      }
    }

    let entryAssets = extractEntryAssets(Array.from(entryPointFiles));
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
