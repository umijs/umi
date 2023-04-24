import plugin from './antd';

test('momentPicker', async () => {
  await executePlugin({});
});

async function executePlugin(mfConfig: any) {
  const webpackConfig = {
    entry: {},
    plugins: [],
  };

  const webpack = {};

  let modifier: Function | null = null;

  const api = {
    EnableBy: {
      config: 'config',
    },
    paths: {
      absSrcPath: '/project/src',
      absTmpPath: '/project/src/.umi',
    },
    config: {
      mf: mfConfig,
    },
    userConfig: {
      mf: mfConfig,
    },
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
    onGenerateFiles() {},
    describe() {},
    modifyWebpackConfig(fn: Function) {
      modifier = fn;
    },
    addRuntimePluginKey() {},
    modifyDefaultConfig() {},
    modifyAppData() {},
    modifyConfig() {},
    addExtraBabelPlugins() {},
    addRuntimePlugin() {},
  };

  plugin(api as any);
  await modifier!(webpackConfig, { webpack });

  return {
    api,
    webpackConfig,
    webpack,
  };
}
