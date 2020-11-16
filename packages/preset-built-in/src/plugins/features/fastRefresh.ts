import { IApi, BundlerConfigType, utils } from 'umi';

const { createDebug } = utils;

const debug = createDebug('umi:preset-build-in:fastRefresh');

export default (api: IApi) => {
  api.describe({
    key: 'fastRefresh',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    // enable by default, back up using view rerender
    enableBy: api.EnableBy.register,
  });

  api.chainWebpack((memo, { type }) => {
    if (api.env === 'development' && type === BundlerConfigType.csr) {
      memo
        .plugin('fastRefresh')
        .use(require('@pmmmwh/react-refresh-webpack-plugin'), [
          { overlay: false },
        ]);
      debug('FastRefresh webpack loaded');
    }
    return memo;
  });

  api.modifyBabelOpts({
    fn: (babelOpts, { type }) => {
      if (api.env === 'development' && type === BundlerConfigType.csr) {
        babelOpts.plugins.push([require.resolve('react-refresh/babel')]);
        debug('FastRefresh babel loaded');
      }
      return babelOpts;
    },
    stage: Infinity,
  });
};
