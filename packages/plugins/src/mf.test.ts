import plugin from './mf';

test('mf plugin dont modify webpack config when no exposes nor remotes', async () => {
  const { ModuleFederationPlugin } = await executePlugin({});
  expect(ModuleFederationPlugin).not.toHaveBeenCalled();
});

test('mf plugin work with bad config', async () => {
  await expect(async () => {
    await executePlugin({
      remotes: [{ name: 'bad' }],
    });
  }).rejects.toThrowError(/Wrong MF#remotes config/);
});

test('mf plugin add remotes with entry and name', async () => {
  const { ModuleFederationPlugin } = await executePlugin({
    remotes: [
      {
        name: 'foo',
        aliasName: 'bar',
        entry: 'http://a.b/c.js',
      },
    ],
  });

  expect(ModuleFederationPlugin).toBeCalledWith(
    expect.objectContaining({
      remotes: {
        bar: 'foo@http://a.b/c.js',
      },
    }),
  );
});

test('mf plugin add remotes with entries for different env', async () => {
  const { ModuleFederationPlugin } = await executePlugin({
    remotes: [
      {
        name: 'foo',
        aliasName: 'bar',
        keyResolver: '"key1"',
        entries: {
          key1: 'http://a.b/c.js',
          key2: 'http://a.b/c.js',
        },
      },
    ],
  });

  expect(ModuleFederationPlugin).toBeCalledWith(
    expect.objectContaining({
      remotes: {
        bar: `promise new Promise(resolve => {
  const entries = {"key1":"http://a.b/c.js","key2":"http://a.b/c.js"};
  const key = "key1";

  const remoteUrlWithVersion = entries[key];
  const script = document.createElement('script')
  script.src = remoteUrlWithVersion
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => window.foo.get(request),
      init: (arg) => {
        try {
          return window.foo.init(arg)
        } catch(e) {
          console.log('remote container already initialized')
        }
      }
    }
    resolve(proxy)
  }
  // inject this script with the src set to the versioned remoteEntry.js
  document.head.appendChild(script);
})
`,
      },
    }),
  );
});

async function executePlugin(mfConfig: any) {
  const webpackConfig = {
    entry: {},
    plugins: [],
  };

  const webpack = { container: { ModuleFederationPlugin: jest.fn() } };

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
  };

  plugin(api as any);
  await modifier!(webpackConfig, { webpack });

  return {
    api,
    webpackConfig,
    webpack,
    ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
  };
}
