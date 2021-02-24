import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'webpack5',
    enableBy: api.EnableBy.config,
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });

  api.onPluginReady(() => {
    console.log('Bundle with webpack 5...');
    process.env.USE_WEBPACK_5 = '1';
  });
};
