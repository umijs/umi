import { IApi, utils } from 'umi';

export default (api: IApi) => {
  const { deepmerge } = utils;
  api.describe({
    key: 'forkTSChecker',
    config: {
      schema(joi) {
        return joi
          .object({
            tsconfig: joi.string().description('Path to tsconfig.json file'),
            compilerOptions: joi
              .object()
              .description(
                'Allows overriding TypeScript options. Should be specified in the same format as you would do for the compilerOptions property in tsconfig.json.',
              ),
            eslint: joi.boolean(),
            eslintOptions: joi.object(),
            async: joi.boolean(),
            ignoreDiagnostics: joi.array().items(joi.number()),
            formatter: joi.valid('default', 'codeframe'),
            formatterOptions: joi.object(),
            silent: joi.boolean(),
            checkSyntacticErrors: joi.boolean(),
          })
          .description(
            'More options see https://www.npmjs.com/package/fork-ts-checker-webpack-plugin#options',
          );
      },
    },
    enableBy: () =>
      (process.env.FORK_TS_CHECKER || !!api.config?.forkTSChecker) as boolean,
  });

  api.chainWebpack((webpackConfig) => {
    webpackConfig
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        deepmerge(
          {
            formatter: 'codeframe',
            // parallel
            async: false,
            checkSyntacticErrors: true,
          },
          api.config?.forkTSChecker || {},
        ),
      ]);
    return webpackConfig;
  });
};
