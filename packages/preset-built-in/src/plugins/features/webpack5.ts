import { IApi } from '@umijs/types';
import { join } from 'path';

export default (api: IApi) => {
  api.describe({
    key: 'webpack5',
    enableBy() {
      return (
        // 需要和 USE_WEBPACK_5 区分开，因为有 mfsu 配置不一定开启 webpack 5
        process.env.ENABLE_WEBPACK_5 ||
        api.userConfig.webpack5 ||
        (api.env === 'development' && api.userConfig.mfsu) ||
        (api.env === 'production' && api.userConfig.mfsu?.production)
      );
    },
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
    // 开启 persistent caching 后，不再需要 babel cache 了
    // 只要不禁用物理缓存，就禁用 babel 缓存
    if (process.env.WEBPACK_FS_CACHE !== 'none') {
      process.env.BABEL_CACHE = 'none';
    }
  });

  api.modifyBundleConfig((memo) => {
    // lazy compilation
    // @ts-ignore
    if (api.env === 'development' && api.config.webpack5?.lazyCompilation) {
      // @ts-ignore
      memo.experiments = {
        // @ts-ignore
        ...memo.experiments,
        lazyCompilation: {
          // client: require.resolve(
          //   '@umijs/deps/compiled/webpack/5/lazy-compilation-web.js',
          // ),
          backend: require('@umijs/deps/compiled/webpack/5/lazyCompilationBackend.js'),
          entries: false,
          // @ts-ignore
          ...api.config.webpack5!.lazyCompilation,
        },
      };
    }

    // 默认开启 top level await
    // @ts-ignore
    memo.experiments = {
      // @ts-ignore
      ...memo.experiments,
      topLevelAwait: true,
    };

    // 缓存默认开启，可通过环境变量关闭
    if (process.env.WEBPACK_FS_CACHE !== 'none') {
      const { configFile } = api.service.configInstance;

      memo.cache = {
        type: 'filesystem',
        // using umi version as `cache.version`
        version: process.env.UMI_VERSION,
        buildDependencies: {
          config: [
            join(api.cwd, 'package.json'),
            api.config.webpack5 && configFile
              ? join(api.cwd, configFile)
              : undefined,
          ].filter(Boolean),
        },
        cacheDirectory: join(api.paths.absTmpPath!, '.cache', 'webpack'),
      };
      // tnpm 安装依赖的情况 webpack 默认的 managedPaths 不生效
      // 使用 immutablePaths 避免 node_modules 的内容被写入缓存
      // tnpm 安装的依赖路径中同时包含包名和版本号，满足 immutablePaths 使用的条件
      // ref: smallfish
      if (/*isTnpm*/ require('react-router/package').__npminstall_done) {
        // @ts-ignore
        memo.snapshot = {
          // @ts-ignore
          ...(memo.snapshot || {}),
          immutablePaths: [api.paths.absNodeModulesPath],
        };
      }
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

    return memo;
  });
};
