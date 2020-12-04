import { IApi, BundlerConfigType, utils } from 'umi';

const { createDebug } = utils;

const debug = createDebug('umi:preset-build-in:fastRefresh');

export default (api: IApi) => {
  /**
   * enable by default, back up using view rerender
   * ssr can't work with fastRefresh
   */
  api.describe({
    key: 'fastRefresh',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config && api.env === 'development',
  });

  api.chainWebpack((memo, { type }) => {
    if (type === BundlerConfigType.csr) {
      memo
        .plugin('fastRefresh')
        .after('hmr')
        .use(require('@pmmmwh/react-refresh-webpack-plugin'), [
          { overlay: false },
        ]);
      debug('FastRefresh webpack loaded');
    }
    return memo;
  });

  api.modifyBabelOpts({
    fn: (babelOpts, { type }) => {
      if (type === BundlerConfigType.csr) {
        babelOpts.plugins.push([require.resolve('react-refresh/babel')]);
        debug('FastRefresh babel loaded');
      }
      return babelOpts;
    },
    stage: Infinity,
  });
};
