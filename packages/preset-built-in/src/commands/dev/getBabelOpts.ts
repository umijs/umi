import { IApi } from '../../types';

export async function getBabelOpts(opts: { api: IApi }) {
  // TODO: 支持用户自定义
  const babelPreset = [
    require.resolve('@umijs/babel-preset-umi'),
    {
      presetEnv: {},
      presetReact: {},
      presetTypeScript: {},
      pluginTransformRuntime: {},
      pluginLockCoreJS: {},
      pluginDynamicImportNode: false,
      pluginAutoCSSModules: opts.api.userConfig.autoCSSModules,
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
  return {
    babelPreset,
    extraBabelPlugins,
    extraBabelPresets,
  };
}
