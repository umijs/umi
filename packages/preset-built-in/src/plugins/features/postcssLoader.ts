import { IApi } from '@umijs/types';

// postcss-loader 4: https://github.com/webpack-contrib/postcss-loader/releases/tag/v4.0.0
const deprecates = ['plugins', 'syntax', 'parser', 'stringifier'];

export default (api: IApi) => {
  api.describe({
    key: 'postcssLoader',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });

  api.modifyConfig((memo) => {
    if (memo?.postcssLoader) {
      const warnDeprecates = Object.keys(
        memo.postcssLoader,
      ).filter((userPostCssKey) => deprecates.includes(userPostCssKey));

      if (warnDeprecates.length > 0) {
        // warning users
        api.logger.warn(
          `[postcssLoader] ${warnDeprecates.join(
            ',',
          )} option was moved to the postcssOptions, using postcssOptions.plugins`,
        );
        // @ts-ignore
        memo.postcssLoader!.postcssOptions = {};
        warnDeprecates.forEach((warnDeprecateKey) => {
          // @ts-ignore
          memo.postcssLoader!.postcssOptions![
            warnDeprecateKey
          ] = memo.postcssLoader![warnDeprecateKey];
          delete memo.postcssLoader![warnDeprecateKey];
        });
      }
    }
    return memo;
  });
};
