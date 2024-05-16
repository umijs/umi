import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'forget',
    config: {
      schema({ zod }) {
        return zod.object({
          ReactCompilerConfig: zod.object({}).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheckConfig(() => {
    if (api.config.mfsu) {
      throw new Error(
        `forget is not compatible with mfsu, please disable mfsu first.`,
      );
    }
    if (api.config.mako) {
      throw new Error(
        `forget is not compatible with mako, please disable mako first.`,
      );
    }
  });

  api.onCheck(() => {
    let reactMajorVersion = api.appData.react.version.split('.')[0];
    if (reactMajorVersion < 19) {
      throw new Error(
        `forget is only compatible with React 19 and above, please upgrade your React version.`,
      );
    }
  });

  api.modifyConfig((memo) => {
    let ReactCompilerConfig = api.userConfig.forget.ReactCompilerConfig || {};
    return {
      ...memo,
      extraBabelPlugins: [
        ...(memo.extraBabelPlugins || []),
        [require.resolve('babel-plugin-react-compiler'), ReactCompilerConfig],
      ],
    };
  });
};
