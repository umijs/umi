import { dirname } from 'path';
import { IApi } from '../../types';
import { resolveProjectDep } from '../../utils/resolveProjectDep';

const BABEL_PLUGIN_NAME = 'babel-plugin-react-compiler';

function getReactCompilerConfig(api: IApi) {
  if ('reactCompiler' in api.userConfig) {
    return api.userConfig.reactCompiler === true
      ? {}
      : api.userConfig.reactCompiler || {};
  }

  const forgetConfig = api.userConfig.forget;
  if (forgetConfig === true) return {};

  return forgetConfig?.ReactCompilerConfig || {};
}

function resolveReactCompilerPlugin(api: IApi) {
  try {
    return (
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: BABEL_PLUGIN_NAME,
      }) || dirname(require.resolve(`${BABEL_PLUGIN_NAME}/package.json`))
    );
  } catch (e) {
    throw new Error(
      `Cannot find ${BABEL_PLUGIN_NAME}. Please install ${BABEL_PLUGIN_NAME} first.`,
    );
  }
}

export default (api: IApi) => {
  api.describe({
    key: 'reactCompiler',
    config: {
      schema({ zod }) {
        return zod.union([zod.boolean(), zod.record(zod.any())]);
      },
    },
    enableBy: ({ userConfig }) => {
      if (userConfig.reactCompiler === false) return false;
      return 'reactCompiler' in userConfig || 'forget' in userConfig;
    },
  });

  api.onCheckConfig(() => {
    if (api.config.mfsu) {
      throw new Error(
        `reactCompiler is not compatible with mfsu, please disable mfsu first.`,
      );
    }
    if (api.config.mako) {
      throw new Error(
        `reactCompiler is not compatible with mako, please disable mako first.`,
      );
    }
    if (api.config.utoopack) {
      throw new Error(
        `reactCompiler is not compatible with utoopack, please disable utoopack first.`,
      );
    }
  });

  api.onCheck(() => {
    const reactMajorVersion = Number(api.appData.react.version.split('.')[0]);
    const compilerConfig = getReactCompilerConfig(api);
    const target = compilerConfig.target;

    if (
      reactMajorVersion < 19 &&
      (!target || target === '19' || target === 19)
    ) {
      throw new Error(
        `reactCompiler requires React 19 by default. For React 17 or 18, please set reactCompiler.target and install react-compiler-runtime.`,
      );
    }
  });

  api.addBeforeBabelPlugins({
    name: 'reactCompiler',
    stage: -10000,
    fn: () => {
      return [[resolveReactCompilerPlugin(api), getReactCompilerConfig(api)]];
    },
  });
};
