import type {
  Compilation,
  Compiler,
} from '@umijs/bundler-webpack/compiled/webpack';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'preset-umi:webpack',
    enableBy: () => api.env === 'production',
  });

  // html 处理逻辑
  const assets: { js: string[]; css: string[]; [key: string]: string[] } = {
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

          // Extract paths to .js, .mjs and .css files from the current compilation
          const entryPointPublicPathMap: Record<string, boolean> = {};
          const extensionRegexp = /\.(css|js|mjs)(\?|$)/;

          const UMI_ASSETS_REG = {
            js: /^umi(\..+)?\.js$/,
            css: /^umi(\..+)?\.css$/,
          };

          entryPointFiles.forEach((entryPointPublicPath) => {
            const extMatch = extensionRegexp.exec(entryPointPublicPath);
            // Skip if the public path is not a .css, .mjs or .js file
            if (!extMatch) {
              return;
            }

            if (entryPointPublicPath.includes('.hot-update')) {
              return;
            }

            // Skip if this file is already known
            // (e.g. because of common chunk optimizations)
            if (entryPointPublicPathMap[entryPointPublicPath]) {
              return;
            }

            // umi html 默认会注入 不做处理
            if (
              UMI_ASSETS_REG.js.test(entryPointPublicPath) ||
              UMI_ASSETS_REG.css.test(entryPointPublicPath)
            ) {
              return;
            }

            entryPointPublicPathMap[entryPointPublicPath] = true;
            // ext will contain .js or .css, because .mjs recognizes as .js
            const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
            assets[ext].push(entryPointPublicPath);
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
      return `${displayPublicPath}${js}`;
    });
  });
};
