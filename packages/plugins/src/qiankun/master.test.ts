import { transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runInNewContext } from 'vm';
import master from './master';

function loadModule(content: string, dependencies: Record<string, any> = {}) {
  const module = { exports: {} as any };
  const { code } = transformSync(content, { loader: 'tsx', format: 'cjs' });
  runInNewContext(code, {
    module,
    exports: module.exports,
    window: {},
    require(id: string) {
      if (!(id in dependencies))
        throw new Error(`Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  });
  return module.exports;
}

function generate(masterConfig: Record<string, any> = {}) {
  const api = {
    cwd: process.cwd(),
    config: {
      base: '/standalone/',
      qiankun: { master: masterConfig, externalQiankun: true },
    },
    describe: jest.fn(),
    addRuntimePlugin: jest.fn(),
    modifyDefaultConfig: jest.fn(),
    modifyRoutes: jest.fn(),
    addRuntimePluginKey: jest.fn(),
    register: jest.fn(),
    onGenerateFiles: jest.fn(),
    writeTmpFile: jest.fn(),
    isPluginEnable: jest.fn(() => false),
    chainWebpack: jest.fn(),
  };
  master(api as any);
  api.onGenerateFiles.mock.calls[0][0]();
  const files = api.writeTmpFile.mock.calls.map(([file]) => file);
  const options = loadModule(
    files.find((file) => file.path === 'masterOptions.ts').content,
  );
  const patchMicroAppRoute = jest.fn();
  const applyPlugins = jest.fn();
  const runtime = loadModule(
    readFileSync(
      join(__dirname, '../../libs/qiankun/master/masterRuntimePlugin.tsx'),
      'utf8',
    ),
    {
      '@@/core/plugin': { getPluginManager: () => ({ applyPlugins }) },
      qiankun: { prefetchApps: jest.fn() },
      umi: { ApplyPluginsType: { modify: 'modify' } },
      './masterOptions': options,
      './common': { patchMicroAppRoute, insertRoute: jest.fn() },
      './routeUtils': { deepFilterLeafRoutes: () => [] },
    },
  );
  async function render(runtimeConfig: Record<string, any> = {}) {
    applyPlugins.mockResolvedValue({
      master: {
        routes: [{ path: '/inner', microApp: 'child' }],
        ...runtimeConfig,
      },
    });
    await runtime.render(jest.fn());
    runtime.patchClientRoutes({ routes: [{ path: '/' }] });
    return patchMicroAppRoute.mock.calls.at(-1)![1];
  }
  return { options, render };
}

test('default base inherits the application instance after route metadata is set', async () => {
  const { options, render } = generate();
  expect(await render()).toMatchObject({
    base: '/standalone/',
    useAppBasename: true,
  });
  expect(options.getMasterOptions()).toMatchObject({
    base: '/standalone/',
    microAppRoutes: [],
  });
  expect(options.getMasterOptions()).not.toHaveProperty('useAppBasename');
});

test.each(['/standalone/', '/explicit/', '', '/'])(
  'static master.base %j keeps its explicit source',
  async (base) => {
    const { options, render } = generate({ base });
    expect(await render()).toMatchObject({ base, useAppBasename: false });
    expect(options.getMasterOptions().base).toBe(base);
  },
);

test.each(['/standalone/', '/runtime/', '', '/'])(
  'runtime master.base %j overrides static configuration and survives later merges',
  async (base) => {
    const { options, render } = generate({ base: '/static/' });
    expect(await render({ base })).toMatchObject({
      base,
      useAppBasename: false,
    });
    // Omitting base preserves the existing cumulative options semantics.
    expect(await render()).toMatchObject({ base, useAppBasename: false });
    expect(options.getMasterOptions().base).toBe(base);
  },
);

test('runtime base equal to the generated default is still explicit', async () => {
  const { render } = generate();
  expect(await render({ base: '/standalone/' })).toMatchObject({
    base: '/standalone/',
    useAppBasename: false,
  });
});
