import { join } from 'path';
import Service from '../Service/Service';

const fixtures = join(__dirname, 'fixtures');

const { NODE_ENV } = process.env;
afterEach(() => {
  // reset UMI_ENV
  // @ts-ignore
  delete process.env.UMI_ENV;
  process.env.NODE_ENV = NODE_ENV;
});

test('umirc', async () => {
  const cwd = join(fixtures, 'umirc');
  const service = new Service({
    cwd,
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('umirc-typescript', async () => {
  const cwd = join(fixtures, 'umirc-typescript');
  const service = new Service({
    cwd,
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('custom-config-file', async () => {
  const cwd = join(fixtures, 'custom-config-file');
  const service = new Service({
    cwd,
    configFiles: ['.foorc.js'],
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('custom-config-file-ts', async () => {
  const cwd = join(fixtures, 'custom-config-file-ts');
  const service = new Service({
    cwd,
    configFiles: ['.foorc.ts'],
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('config-config', async () => {
  const cwd = join(fixtures, 'config-config');
  const service = new Service({
    cwd,
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('config-config-typescript', async () => {
  const cwd = join(fixtures, 'config-config-typescript');
  const service = new Service({
    cwd,
  });
  expect(service.userConfig).toEqual({ foo: 'bar' });
});

test('umi-env', async () => {
  const cwd = join(fixtures, 'umi-env');
  const s1 = new Service({
    cwd,
  });
  expect(s1.userConfig).toEqual({
    foo: 1,
    bar: 1,
    nest: {
      foo: {
        bar: 2,
      },
    },
  });
  process.env.UMI_ENV = 'cloud';
  const s2 = new Service({
    cwd,
  });
  expect(s2.userConfig).toEqual({
    foo: 2,
    bar: 1,
    nest: {
      foo: {
        bar: 123,
      },
    },
  });
});

test('umi-env-dot-env', async () => {
  const cwd = join(fixtures, 'umi-env-dot-env');
  const s1 = new Service({
    cwd,
  });
  expect(s1.userConfig).toEqual({
    bar: 2,
    foo: 3,
    nest: 4,
  });
});

test('umi-env-dot-env-ext', async () => {
  const cwd = join(fixtures, 'umi-env-dot-env-ext');
  const s1 = new Service({
    cwd,
  });
  expect(s1.userConfig).toEqual({
    bar: 2,
    foo: 3,
    nest: 4,
  });
});

test('umi-env throw error if env affix file not exist', async () => {
  const cwd = join(fixtures, 'umi-env');
  process.env.UMI_ENV = 'cloud2';
  expect(() => {
    new Service({
      cwd,
    });
  }).toThrow(/get user config failed/);
});

test('local', async () => {
  const cwd = join(fixtures, 'local');
  process.env.NODE_ENV = 'development';
  const service = new Service({
    cwd,
  });
  expect(service.userConfig).toEqual({ foo: 'local', bar: 1 });
});

test('default config', async () => {
  const cwd = join(fixtures, 'default-config');
  const service = new Service({
    cwd,
    plugins: [join(cwd, 'plugin.js')],
  });
  await service.init();
  expect(service.userConfig).toEqual({ plugin: { bar: 2 } });
  expect(service.config).toEqual({
    plugin: {
      // api.modifyDefaultConfig
      foo: 'foo-bar',
      // user config
      bar: 2,
      // api.modifyConfig
      hoo: 'hoo',
    },
  });
});

test('schema validate success', async () => {
  const cwd = join(fixtures, 'schema');
  const service = new Service({
    cwd,
    plugins: [join(cwd, 'plugin_string.js')],
  });
  await service.init();
  expect(service.config).toEqual({ foo: 'string' });
});

test('schema validate failed', async () => {
  const cwd = join(fixtures, 'schema');
  const service = new Service({
    cwd,
    plugins: [join(cwd, 'plugin_number.js')],
  });
  await expect(service.init()).rejects.toThrow(/"value" must be a number/);
});

test('invalid keys', async () => {
  const cwd = join(fixtures, 'invalid-keys');
  const service = new Service({
    cwd,
  });
  await expect(service.init()).rejects.toThrow(/Invalid config key: foo/);
});
