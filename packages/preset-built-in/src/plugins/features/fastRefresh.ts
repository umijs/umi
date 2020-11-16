import { IApi, BundlerConfigType } from 'umi';

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
    }
    return memo;
  });

  api.modifyBabelOpts({
    fn: (babelOpts, { type }) => {
      if (api.env === 'development' && type === BundlerConfigType.csr) {
        babelOpts.plugins.push([require.resolve('react-refresh/babel')]);
      }
      return babelOpts;
    },
    stage: Infinity,
  });
};
