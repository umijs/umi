import { readFileSync } from 'fs';
import { Mustache } from 'umi/plugin-utils';
import antd from './antd';

jest.mock('antd/package.json', () => ({ version: '5.17.0' }));

function generateRuntime(antdConfig: Record<string, any>, legacy = false) {
  const api = {
    cwd: process.cwd(),
    pkg: {},
    config: { antd: antdConfig, alias: {}, legacy },
    describe: jest.fn(),
    addRuntimePluginKey: jest.fn(),
    onCheck: jest.fn(),
    modifyAppData: jest.fn(),
    modifyConfig: jest.fn(),
    chainWebpack: jest.fn(),
    addExtraBabelPlugins: jest.fn(),
    onGenerateFiles: jest.fn(),
    writeTmpFile: jest.fn(),
    isPluginEnable: jest.fn(() => false),
    addRuntimePlugin: jest.fn(),
    addEntryImportsAhead: jest.fn(),
    logger: { warn: jest.fn() },
  };
  antd(api as any);
  api.config = api.modifyConfig.mock.calls[0][0](api.config);
  api.onGenerateFiles.mock.calls[0][0]();
  const runtime = api.writeTmpFile.mock.calls
    .map(([file]) => file)
    .find((file) => file.path === 'runtime.tsx');
  return {
    config: api.config.antd,
    content: Mustache.render(
      readFileSync(runtime.tplPath, 'utf8'),
      runtime.context,
    ),
  };
}

afterEach(() => {
  require('antd/package.json').version = '5.17.0';
});

test.each(['5.17.0', '6.0.0'])(
  'antd %s forwards layer without enabling ConfigProvider',
  (version) => {
    require('antd/package.json').version = version;
    const { config, content } = generateRuntime({
      styleProvider: { layer: true },
    });
    expect(content).toMatch(/<StyleProvider\s+layer=\{\s*true\s*\}/);
    expect(config.configProvider).toBeUndefined();
    expect(content).not.toContain('<ConfigProvider');
  },
);

test('layer preserves existing ConfigProvider options', () => {
  const configProvider = {
    prefixCls: 'custom',
    theme: { token: { colorPrimary: 'red' } },
  };
  const { config, content } = generateRuntime({
    styleProvider: { layer: true },
    configProvider,
  });
  expect(config.configProvider).toBe(configProvider);
  expect(content).toContain(JSON.stringify(configProvider));
  expect(content).toContain(
    'container = <ConfigProvider {...antdConfig}>{container}</ConfigProvider>',
  );
  expect(content.indexOf('<ConfigProvider')).toBeLessThan(
    content.indexOf('<StyleProvider'),
  );
});

test('explicit false is forwarded so an outer layer can be overridden', () => {
  const { config, content } = generateRuntime({
    styleProvider: { layer: false },
  });
  expect(content).toMatch(/<StyleProvider\s+layer=\{\s*false\s*\}/);
  expect(config.configProvider).toBeUndefined();
});

test('an unset layer preserves defaults', () => {
  const { config, content } = generateRuntime({ styleProvider: {} });
  expect(content).toContain('<StyleProvider');
  expect(content).not.toMatch(/\blayer=/);
  expect(config.configProvider).toBeUndefined();
});

test('layer keeps IE compatibility options', () => {
  const { content } = generateRuntime({ styleProvider: { layer: true } }, true);
  expect(content).toMatch(/\blayer=\{\s*true\s*\}/);
  expect(content).toContain('hashPriority="high"');
  expect(content).toContain(
    'transformers={[legacyLogicalPropertiesTransformer]}',
  );
});

test('no styleProvider keeps the wrapper disabled', () => {
  const { config, content } = generateRuntime({});
  expect(content).not.toContain('<StyleProvider');
  expect(config.configProvider).toBeUndefined();
});

test('antd 4 does not enable modern providers for layer', () => {
  require('antd/package.json').version = '4.24.16';
  const { config, content } = generateRuntime({
    styleProvider: { layer: true },
  });
  expect(content).not.toContain('<StyleProvider');
  expect(config.configProvider).toBeUndefined();
});
