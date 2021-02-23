import { IApi, utils } from 'umi';

export default (api: IApi) => {
  const { deepmerge } = utils;
  api.describe({
    key: 'forkTSChecker',
    config: {
      schema(joi) {
        return joi
          .object({
            async: joi.boolean(),
            typescript: joi.alternatives(joi.boolean(), joi.object()),
            eslint: joi.object(),
            issue: joi.object(),
            formatter: joi.alternatives(joi.string(), joi.object()),
            logger: joi.object(),
          })
          .unknown()
          .description(
            'fork-ts-checker-webpack-plugin options see https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options',
          );
      },
    },
    enableBy: () =>
      (process.env.FORK_TS_CHECKER || !!api.config?.forkTSChecker) as boolean,
  });

  api.chainWebpack((webpackConfig) => {
    webpackConfig
      .plugin('fork-ts-checker')
      .use(require('@umijs/deps/compiled/fork-ts-checker-webpack-plugin'), [
        deepmerge(
          {
            formatter: 'codeframe',
            async: false,
          },
          api.config?.forkTSChecker || {},
        ),
      ]);
    return webpackConfig;
  });
};
