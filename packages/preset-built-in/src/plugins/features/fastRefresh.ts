import { BundlerConfigType, IApi } from '@umijs/types';

export default (api: IApi) => {
  const { createDebug } = api.utils;
  const debug = createDebug('umi:preset-build-in:fastRefresh');

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
    enableBy: api.EnableBy.config,
  });

  api.chainWebpack((memo, { type, mfsu }) => {
    // must add api.env, test env needed.
    if (!mfsu && api.env === 'development' && type === BundlerConfigType.csr) {
      memo
        .plugin('fastRefresh')
        .after('hmr')
        .use(
          require('../../../bundled/@pmmmwh/react-refresh-webpack-plugin/lib'),
          [{ overlay: false }],
        );
      debug('FastRefresh webpack loaded');
    }
    return memo;
  });

  // enable no-anonymous-default-export
  api.modifyBabelPresetOpts((opts, { type, mfsu }) => {
    if (!mfsu && api.env === 'development' && type === BundlerConfigType.csr) {
      return {
        ...opts,
        noAnonymousDefaultExport: true,
      };
    }
    return opts;
  });

  api.modifyBabelOpts({
    fn: (babelOpts, { type, mfsu }) => {
      if (
        !mfsu &&
        api.env === 'development' &&
        type === BundlerConfigType.csr
      ) {
        babelOpts.plugins.push([require.resolve('react-refresh/babel')]);
        debug('FastRefresh babel loaded');
      }
      return babelOpts;
    },
    stage: Infinity,
  });
};
