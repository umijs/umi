import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'forkTSCheker',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: () =>
      (process.env.FORK_TS_CHECKER || !!api.config?.forkTSCheker) as boolean,
  });

  api.chainWebpack(webpackConfig => {
    webpackConfig
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        {
          formatter: 'codeframe',
          // parallel
          async: false,
          checkSyntacticErrors: true,
        },
      ]);
    return webpackConfig;
  });
};
