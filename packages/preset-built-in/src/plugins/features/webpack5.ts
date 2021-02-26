import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'webpack5',
    enableBy: api.EnableBy.config,
    config: {
      schema(joi) {
        return joi.object().keys({
          lazyCompilation: joi.object(),
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
    if (api.config.webpack5!.lazyCompilation) {
      // @ts-ignore
      memo.experiments = {
        // @ts-ignore
        ...memo.experiments,
        lazyCompilation: {
          // client: '@umijs/deps/compiled/webpack/5/lazy-compilation-web.js',
          backend: require('@umijs/deps/compiled/webpack/5/lazyCompilationBackend.js'),
          ...api.config.webpack5!.lazyCompilation,
        },
      };
    }
    return memo;
  });
};
