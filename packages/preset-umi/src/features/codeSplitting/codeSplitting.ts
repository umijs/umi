import crypto from 'crypto';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'codeSplitting',
    config: {
      schema({ zod }) {
        return zod.object({
          jsStrategy: zod.enum(['bigVendors', 'depPerChunk', 'granularChunks']),
          jsStrategyOptions: zod.object({}).optional(),
          cssStrategy: zod.enum(['mergeAll']).optional(),
          cssStrategyOptions: zod.object({}).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
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
                !isModuleCSS(module) &&
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module: any) {
              const rawRequest =
                module.rawRequest &&
                module.rawRequest.replace(/^@(\w+)[/\\]/, '$1-');
              if (rawRequest) {
                return `${
                  // when `require()` a package with relative path,
                  // need remove leading `.` and `/`, otherwise will not found `.js` file
                  // e.g. require('../../lib/codemirror')
                  rawRequest.replace(/\./g, '_').replace(/\//g, '-')
                }-lib`;
              }

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
            chunks: 'async',
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
            chunks: 'async',
          },
        },
      });
    }
    if (cssStrategy) {
      throw new Error(`codeSplitting.cssStrategy is not supported yet`);
    }
    return memo;
  });
};

function isModuleCSS(module: { type: string }) {
  return (
    // mini-css-extract-plugin
    module.type === `css/mini-extract` ||
    // extract-css-chunks-webpack-plugin (old)
    module.type === `css/extract-chunks` ||
    // extract-css-chunks-webpack-plugin (new)
    module.type === `css/extract-css-chunks`
  );
}
