import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import { BundlerConfigType } from '@umijs/types';
import getConfig from './getConfig';

beforeAll(() => {
  defaultWebpack.init(true);
});

test('nodePolyfill', async () => {
  const config = await getConfig({
    __disableTerserForTest: true,
    cwd: '/foo',
    config: {},
    env: 'production',
    type: BundlerConfigType.csr,
  });
  expect((config?.resolve as any)?.fallback).toBeTruthy();

  const providePlugins = config.plugins?.filter(
    (plugin) => plugin instanceof defaultWebpack.ProvidePlugin,
  );
  expect(providePlugins.length).toBeGreaterThan(0);

  const nodePolyfillPlugin: any = providePlugins.find(
    (plugin) => (plugin as any)?.definitions?.Buffer,
  );

  expect(nodePolyfillPlugin.definitions).toEqual({
    process: require('node-libs-browser')['process'],
    Buffer: ['buffer', 'Buffer'],
  });
});

test('disable nodePolyfill', async () => {
  process.env.NODE_POLYFILL = 'none';
  const config = await getConfig({
    __disableTerserForTest: true,
    cwd: '/foo',
    config: {},
    env: 'production',
    type: BundlerConfigType.csr,
  });
  expect((config?.resolve as any)?.fallback).toBeFalsy();

  const providePlugins = config.plugins?.filter(
    (plugin) => plugin instanceof defaultWebpack.ProvidePlugin,
  );
  const nodePolyfillPlugin: any = providePlugins.find(
    (plugin) => (plugin as any)?.definitions?.Buffer,
  );

  expect(nodePolyfillPlugin).toBeFalsy();
});
