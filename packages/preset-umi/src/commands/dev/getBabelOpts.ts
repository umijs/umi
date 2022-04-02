import { semver } from '@umijs/utils';
import { IApi } from '../../types';

export async function getBabelOpts(opts: { api: IApi }) {
  // TODO: 支持用户自定义
  const isGTEReact17 = semver.gte(opts.api.appData.react.version, '17.0.0');
  const babelPreset = [
    require.resolve('@umijs/babel-preset-umi'),
    {
      presetEnv: {},
      presetReact: {
        runtime: isGTEReact17 ? 'automatic' : 'classic',
        // importSource cannot be set when runtime is classic
        ...(isGTEReact17 ? {} : { importSource: undefined }),
      },
      presetTypeScript: {},
      pluginTransformRuntime: {},
      pluginLockCoreJS: {},
      pluginDynamicImportNode: false,
      pluginAutoCSSModules: opts.api.config.autoCSSModules,
    },
  ];
  const extraBabelPresets = await opts.api.applyPlugins({
    key: 'addExtraBabelPresets',
    initialValue: [],
  });
  const extraBabelPlugins = await opts.api.applyPlugins({
    key: 'addExtraBabelPlugins',
    initialValue: [],
  });
  const beforeBabelPresets = await opts.api.applyPlugins({
    key: 'addBeforeBabelPresets',
    initialValue: [],
  });
  const beforeBabelPlugins = await opts.api.applyPlugins({
    key: 'addBeforeBabelPlugins',
    initialValue: [],
  });
  return {
    babelPreset,
    extraBabelPlugins,
    extraBabelPresets,
    beforeBabelPresets,
    beforeBabelPlugins,
  };
}
