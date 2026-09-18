import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { Mustache } from 'umi/plugin-utils';
import antd from './antd';

jest.mock('antd/package.json', () => ({ version: '5.17.0' }));

function generateRuntime(
  antdConfig: Record<string, any>,
  legacy = false,
  project = { cwd: process.cwd(), pkg: {} },
) {
  const api = {
    ...project,
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
    logger: { warn: jest.fn(), fatal: jest.fn() },
  };
  antd(api as any);
  api.config = api.modifyConfig.mock.calls[0][0](api.config);
  api.onGenerateFiles.mock.calls[0][0]();
  const runtime = api.writeTmpFile.mock.calls
    .map(([file]) => file)
    .find((file) => file.path === 'runtime.tsx');
  return {
    api,
    config: api.config.antd,
    content: Mustache.render(
      readFileSync(runtime.tplPath, 'utf8'),
      runtime.context,
    ),
  };
}

const originalAntdEnable = process.env.UMI_PLUGIN_ANTD_ENABLE;
let frameworkPkgPath: string;

beforeEach(() => {
  delete process.env.UMI_PLUGIN_ANTD_ENABLE;
  frameworkPkgPath = mkdtempSync(join(tmpdir(), 'umi-framework-antd-'));
});

afterEach(() => {
  require('antd/package.json').version = '5.17.0';
  if (originalAntdEnable === undefined) {
    delete process.env.UMI_PLUGIN_ANTD_ENABLE;
  } else {
    process.env.UMI_PLUGIN_ANTD_ENABLE = originalAntdEnable;
  }
  rmSync(frameworkPkgPath, { recursive: true, force: true });
});

test('framework antd path controls version checks, aliases and runtime generation', () => {
  writeFileSync(
    join(frameworkPkgPath, 'package.json'),
    JSON.stringify({ name: 'antd', version: '4.24.16' }),
  );
  // The framework owns antd 4, while the plugin fallback resolves antd 5.
  process.env.UMI_PLUGIN_ANTD_ENABLE = JSON.stringify({
    pkgPath: frameworkPkgPath,
    defaultConfig: { import: true },
  });
  const { api, config, content } = generateRuntime({
    styleProvider: { layer: true },
  });
  expect(config.import).toBe(true);
  expect(api.config.alias).toEqual({ antd: frameworkPkgPath });
  expect(api.modifyAppData.mock.calls[0][0]({}).antd).toEqual({
    pkgPath: frameworkPkgPath,
    version: '4.24.16',
  });
  expect(content).not.toContain('<StyleProvider');
  expect(api.logger.fatal).not.toHaveBeenCalled();
});

test.each([undefined, '', JSON.stringify({ defaultConfig: {} })])(
  'missing framework path preserves fallback resolution (%s)',
  (enable) => {
    if (enable !== undefined) process.env.UMI_PLUGIN_ANTD_ENABLE = enable;
    const { api, content } = generateRuntime({
      styleProvider: { layer: true },
    });
    expect(api.config.alias).toEqual({
      antd: dirname(require.resolve('antd/package.json')),
    });
    expect(content).toContain('<StyleProvider');
  },
);

test('an explicit project dependency takes priority over the framework fallback', () => {
  const cwd = join(frameworkPkgPath, 'project');
  const projectAntd = join(cwd, 'node_modules/antd');
  mkdirSync(projectAntd, { recursive: true });
  writeFileSync(
    join(projectAntd, 'package.json'),
    JSON.stringify({ name: 'antd', version: '5.29.3' }),
  );
  writeFileSync(
    join(frameworkPkgPath, 'package.json'),
    JSON.stringify({ name: 'antd', version: '4.24.16' }),
  );
  process.env.UMI_PLUGIN_ANTD_ENABLE = JSON.stringify({
    pkgPath: frameworkPkgPath,
    defaultConfig: {},
  });
  const { api, content } = generateRuntime(
    { styleProvider: { layer: true } },
    false,
    { cwd, pkg: { dependencies: { antd: '^5.0.0' } } },
  );
  expect(api.config.alias).toEqual({ antd: projectAntd });
  expect(content).toContain('<StyleProvider');
});

test('legacy theme variables are loaded from the selected framework package', () => {
  writeFileSync(
    join(frameworkPkgPath, 'package.json'),
    JSON.stringify({ name: 'antd', version: '4.24.16' }),
  );
  mkdirSync(join(frameworkPkgPath, 'dist'));
  writeFileSync(
    join(frameworkPkgPath, 'dist/theme.js'),
    'exports.getThemeVariables = () => ({ "framework-theme": "selected" });',
  );
  process.env.UMI_PLUGIN_ANTD_ENABLE = JSON.stringify({
    pkgPath: frameworkPkgPath,
    defaultConfig: { import: true },
  });
  const { api } = generateRuntime({ dark: true });
  expect((api.config as any).theme['framework-theme']).toBe('selected');
});

test('an invalid framework path fails instead of silently using another antd', () => {
  process.env.UMI_PLUGIN_ANTD_ENABLE = JSON.stringify({
    pkgPath: join(frameworkPkgPath, 'missing'),
    defaultConfig: {},
  });
  expect(() => generateRuntime({})).toThrow();
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
