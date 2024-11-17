import path from 'path';
import { IApi } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
} from '../../utils/extractEntryAssets';

export default (api: IApi) => {
  api.describe({
    key: 'mako',
    config: {
      schema({ zod }) {
        return zod
          .object({
            plugins: zod.array(
              zod
                .object({
                  load: zod.function(),
                  generateEnd: zod.function(),
                })
                .partial(),
            ),
            px2rem: zod
              .object({
                root: zod.number(),
                propBlackList: zod.array(zod.string()),
                propWhiteList: zod.array(zod.string()),
                selectorBlackList: zod.array(zod.string()),
                selectorWhiteList: zod.array(zod.string()),
                selectorDoubleList: zod.array(zod.string()),
              })
              .partial(),
            experimental: zod
              .object({
                webpackSyntaxValidate: zod.array(zod.string()),
              })
              .partial(),
            flexBugs: zod.boolean(),
            optimization: zod
              .object({
                skipModules: zod.boolean(),
              })
              .partial(),
          })
          .partial();
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

  api.modifyConfig((memo) => {
    const makoPlugins = memo.mako?.plugins || [];
    if (!api.config.mpa) {
      makoPlugins.push({
        name: 'UmiHtmlGenerationMako',
        generateEnd: ({ stats }: any) => {
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
        },
      });
    }
    return {
      ...memo,
      mfsu: false,
      hmrGuardian: false,
      mako: {
        ...memo.mako,
        plugins: makoPlugins,
      },
    };
  });

  api.onStart(() => {
    process.env.OKAM =
      process.env.OKAM || require.resolve('@umijs/bundler-mako');
    try {
      const pkg = require(path.join(
        require.resolve(process.env.OKAM),
        '../package.json',
      ));
      api.logger.info(`Using mako@${pkg.version}`);
      const isBigfish = process.env.BIGFISH_INFO;
      if (!isBigfish) {
        api.logger.info(
          `Mako is an extremely fast, production-grade web bundler based on Rust. If you encounter any issues, please checkout https://makojs.dev/ to join the community and report the issue.`,
        );
      }
    } catch (e) {
      console.error(e);
    }
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
