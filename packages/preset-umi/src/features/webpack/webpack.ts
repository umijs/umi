import type {
  Compilation,
  Compiler,
} from '@umijs/bundler-webpack/compiled/webpack';
import { IApi } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
} from '../../utils/extractEntryAssets';

export default (api: IApi) => {
  api.describe({
    key: 'preset-umi:webpack',
    enableBy: () => api.env === 'production',
  });

  // html 处理逻辑
  const assets: EntryAssets = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  class HtmlWebpackPlugin {
    apply(compiler: Compiler) {
      compiler.hooks.emit.tapPromise(
        'UmiHtmlGeneration',
        async (compilation: Compilation) => {
          const entryPointFiles = compilation.entrypoints
            .get('umi')!
            .getFiles();
          let entryAssets = extractEntryAssets(entryPointFiles);
          Object.entries(entryAssets).forEach(([ext, files]) => {
            if (!Array.isArray(assets[ext])) {
              assets[ext] = [];
            }
            assets[ext].push(...files);
          });
        },
      );
    }
  }

  api.modifyWebpackConfig((config) => {
    if (!api.config.mpa) {
      // 处理 代码拆分时, 拆分的 非 入口文件, 自动注入到 html 文件中
      config.plugins?.push(new HtmlWebpackPlugin());
    }
    return config;
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
      return { src: `${displayPublicPath}${js}` };
    });
  });
};
