import path from 'path';
import { IApi } from '../../types';
import { isWindows } from '../../utils/platform';

export default (api: IApi) => {
  api.describe({
    key: 'mako',
    config: {
      schema({ zod }) {
        return zod
          .object({
            plugins: zod.array(
              zod
                .object({
                  load: zod.function(),
                  generateEnd: zod.function(),
                })
                .partial(),
            ),
            px2rem: zod
              .object({
                root: zod.number(),
                propBlackList: zod.array(zod.string()),
                propWhiteList: zod.array(zod.string()),
                selectorBlackList: zod.array(zod.string()),
                selectorWhiteList: zod.array(zod.string()),
                selectorDoubleList: zod.array(zod.string()),
              })
              .partial(),
            experimental: zod
              .object({
                webpackSyntaxValidate: zod.array(zod.string()),
              })
              .partial(),
            flexBugs: zod.boolean(),
            optimization: zod
              .object({
                skipModules: zod.boolean(),
              })
              .partial(),
          })
          .partial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig((memo) => {
    // @TODO remove this when mako support windows
    if (isWindows) {
      memo.mako = false;
      process.env.OKAM = '';
    }
    return {
      ...memo,
      mfsu: false,
      hmrGuardian: false,
      makoPlugins: memo.mako?.plugins || [],
    };
  });

  api.onStart(() => {
    process.env.OKAM =
      process.env.OKAM || require.resolve('@umijs/bundler-mako');
    try {
      const pkg = require(path.join(
        require.resolve(process.env.OKAM),
        '../package.json',
      ));
      api.logger.info(`Using mako@${pkg.version}`);
      const isBigfish = process.env.BIGFISH_INFO;
      if (!isBigfish) {
        api.logger.info(
          `Mako is an extremely fast, production-grade web bundler based on Rust. If you encounter any issues, please checkout https://makojs.dev/ to join the community and report the issue.`,
        );
      }
    } catch (e) {
      console.error(e);
    }
  });
};
