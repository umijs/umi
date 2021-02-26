import { IApi } from '@umijs/types';
import { join } from 'path';

export default (api: IApi) => {
  api.describe({
    key: 'webpack5',
    enableBy: api.EnableBy.config,
    config: {
      schema(joi) {
        return joi.object().keys({
          // Ref: https://webpack.js.org/configuration/experiments/#experimentslazycompilation
          lazyCompilation: joi.object().keys({
            entries: joi.boolean(),
            imports: joi.boolean(),
            test: joi.any(),
          }),
        });
      },
    },
  });

  api.onPluginReady(() => {
    const command = process.argv[2];
    if (['dev', 'build'].includes(command)) {
      console.log('Bundle with webpack 5...');
    }
    process.env.USE_WEBPACK_5 = '1';
  });

  api.modifyBundleConfig((memo) => {
    // lazy compilation
    // @ts-ignore
    if (api.config.webpack5!.lazyCompilation) {
      // @ts-ignore
      memo.experiments = {
        // @ts-ignore
        ...memo.experiments,
        lazyCompilation: {
          // client: '@umijs/deps/compiled/webpack/5/lazy-compilation-web.js',
          backend: require('@umijs/deps/compiled/webpack/5/lazyCompilationBackend.js'),
          entries: false,
          // @ts-ignore
          ...api.config.webpack5!.lazyCompilation,
        },
      };
    }

    // 缓存默认开启，可通过环境变量关闭
    if (process.env.WEBPACK_FS_CACHE !== 'none') {
      memo.cache = {
        type: 'filesystem',
        // using umi version as `cache.version`
        version: process.env.UMI_VERSION,
        buildDependencies: {},
        cacheDirectory: join(api.paths.absTmpPath!, '.cache', 'webpack'),
      };
      // 缓存失效会有日志，这里清除下日志
      // @ts-ignore
      memo.infrastructureLogging = {
        level: 'error',
        ...(process.env.WEBPACK_FS_CACHE_DEBUG
          ? {
              debug: /webpack\.cache/,
            }
          : {}),
      };
    }

    api.modifyBabelOpts((memo) => {
      // 开启 persistent caching 后，不再需要 babel cache 了
      // 只要不禁用物理缓存，就禁用 babel 缓存
      if (process.env.WEBPACK_FS_CACHE !== 'none') {
        memo.cacheDirectory = false;
      }
      return memo;
    });

    return memo;
  });
};
