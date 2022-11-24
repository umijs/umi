import crypto from 'crypto';
import type webpack from '@umijs/bundler-webpack/compiled/webpack';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'codeSplitting',
    config: {
      schema(Joi) {
        return Joi.object({
          jsStrategy: Joi.string().allow(
            'bigVendors',
            'depPerChunk',
            'granularChunks',
          ),
          jsStrategyOptions: Joi.object(),
          cssStrategy: Joi.string().allow('mergeAll'),
          cssStrategyOptions: Joi.object(),
        });
      },
    },
    enableBy() {
      if (api.env !== 'production' || !!api.config.vite) {
        return false;
      }
      return 'codeSplitting' in api.config;
    },
  });

  api.chainWebpack((memo) => {
    if (api.env !== 'production') return;

    const { jsStrategy, jsStrategyOptions, cssStrategy } =
      api.config.codeSplitting;
    if (jsStrategy === 'bigVendors') {
      memo.optimization.splitChunks({
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            name: 'vendors',
            chunks: 'async',
            ...jsStrategyOptions,
          },
        },
      });
    }
    if (jsStrategy === 'depPerChunk') {
      memo.optimization.splitChunks({
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'async',
            name(module: any) {
              // e.g. node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es
              const path = module.context.replace(/.pnpm[\\/]/, '');
              const match = path.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'npm.unknown';
              const packageName = match[1];
              return `npm.${packageName
                .replace(/@/g, '_at_')
                .replace(/\+/g, '_')}`;
            },
          },
        },
      });
    }
    if (jsStrategy === 'granularChunks') {
      const FRAMEWORK_BUNDLES = [
        'react-dom',
        'react',
        // 'core-js',
        // 'regenerator-runtime',
        'history',
        'react-router',
        'react-router-dom',
        'scheduler',
        // TODO
        // add renderer-react
      ];
      memo.optimization.splitChunks({
        cacheGroups: {
          default: false,
          defaultVendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: new RegExp(
              `[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
                `|`,
              )})[\\\\/]`,
            ),
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module: any) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module: any) {
              const rawRequest =
                module.rawRequest &&
                module.rawRequest.replace(/^@(\w+)[/\\]/, '$1-');
              if (rawRequest) return `${rawRequest}-lib`;

              const identifier = module.identifier();
              const trimmedIdentifier = /(?:^|[/\\])node_modules[/\\](.*)/.exec(
                identifier,
              );
              const processedIdentifier =
                trimmedIdentifier &&
                trimmedIdentifier[1].replace(/^@(\w+)[/\\]/, '$1-');

              return `${processedIdentifier || identifier}-lib`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          shared: {
            name(_module: any, chunks: any) {
              const cryptoName = crypto
                .createHash('sha1')
                .update(
                  chunks.reduce((acc: any, chunk: any) => {
                    return acc + chunk.name;
                  }, ''),
                )
                .digest('base64')
                // replace `+=/` that may be escaped in the url
                // https://github.com/umijs/umi/issues/9845
                .replace(/\//g, '')
                .replace(/\+/g, '-')
                .replace(/=/g, '_');
              return `shared-${cryptoName}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      });
    }
    if (cssStrategy) {
      throw new Error(`codeSplitting.cssStrategy is not supported yet`);
    }
    return memo;
  });

  // html 处理逻辑
  const assets: { js: string[]; css: string[]; [key: string]: string[] } = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      compiler.hooks.emit.tapPromise(
        'UmiHtmlGeneration',
        async (compilation) => {
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
    config.plugins?.push(new HtmlWebpackPlugin());
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
