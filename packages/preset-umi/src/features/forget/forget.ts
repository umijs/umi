import { dirname } from 'path';
import { IApi } from '../../types';
import { resolveProjectDep } from '../../utils/resolveProjectDep';

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

  const BABEL_PLUGIN_NAME = `babel-plugin-react-compiler`;
  let libPath: string;
  try {
    libPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: BABEL_PLUGIN_NAME,
      }) || dirname(require.resolve(`${BABEL_PLUGIN_NAME}/package.json`));
  } catch (e) {}

  api.modifyConfig((memo) => {
    let ReactCompilerConfig = api.userConfig.forget.ReactCompilerConfig || {};
    return {
      ...memo,
      extraBabelPlugins: [
        ...(memo.extraBabelPlugins || []),
        [libPath, ReactCompilerConfig],
      ],
    };
  });
};
