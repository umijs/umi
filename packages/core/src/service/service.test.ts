import { existsSync } from 'fs';
import { join } from 'path';
import { Env } from '../types';
import { Service } from './service';

const base = join(__dirname, '../../fixtures/service');

function buildService(opts: { name: string }) {
  const cwd = join(base, opts.name);
  const pluginPath = join(cwd, 'plugin.ts');
  return new Service({
    cwd,
    env: Env.development,
    defaultConfigFiles: ['.umirc.ts', 'config/config.ts'],
    plugins: [(existsSync(pluginPath) && pluginPath) as string].filter(Boolean),
  });
}

test('plugin should not return', async () => {
  const service = buildService({ name: 'plugin-should-not-return' });
  await expect(service.run({ name: 'test' })).rejects.toThrow(
    /plugin should return nothing/,
  );
});

test('config normal', async () => {
  const service = buildService({ name: 'umi-env' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    foo: 1,
    bar: 1,
    nest: {
      foo: {
        bar: 2,
      },
    },
  });
});

test('config umi-env', async () => {
  process.env.UMI_ENV = 'cloud';
  const service = buildService({ name: 'umi-env' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    foo: 2,
    bar: 1,
    nest: {
      foo: {
        bar: 123,
      },
    },
  });
  process.env.UMI_ENV = '';
});

test('config umi-env local', async () => {
  const service = buildService({ name: 'umi-env-local' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    bar: 88,
    foo: 1,
    nest: 4,
    local: 4,
  });
});

xtest('config umi-env as short env name, should throw an error', async () => {
  process.env.UMI_ENV = 'dev';
  const service = buildService({ name: 'umi-env' });
  await expect(service.run({ name: 'userConfig' })).rejects.toThrow(
    /Do not configure/,
  );
});

test('config umi-env-dot-env', async () => {
  const service = buildService({ name: 'umi-env-dot-env' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    bar: 2,
    foo: 3,
    nest: 4,
  });
});

test('config umi-env-dot-env-expand', async () => {
  const service = buildService({ name: 'umi-env-dot-env-expand' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    bar: 6,
    foo: 7,
    nest: 8,
  });
});

test('service custom paths', async () => {
  class UmiService extends Service {
    constructor(opts: any) {
      super({
        ...opts,
      });
    }

    sayUmiHello() {
      return 'umi hello';
    }
  }

  const customPaths = {
    cwd: 'cwd-1',
    absSrcPath: 'absSrcPath-2',
    absPagesPath: '3',
    absApiRoutesPath: '4',
    absTmpPath: 'absTmpPath-5',
    absNodeModulesPath: '6',
    absOutputPath: '7',
  };

  class DumiService extends UmiService {
    constructor(opts: any) {
      super({
        ...opts,
      });
    }

    async getPaths() {
      return customPaths;
    }
  }

  const cwd = join(base, 'service-custom-paths');
  const pluginPath = join(cwd, 'plugin.ts');
  const service = new DumiService({
    cwd,
    env: Env.development,
    defaultConfigFiles: ['config/config.ts'],
    plugins: [(existsSync(pluginPath) && pluginPath) as string].filter(Boolean),
  });

  const config = await service.run({ name: 'config' });

  expect(service.sayUmiHello()).toBe('umi hello');
  expect(service.paths).toBe(customPaths);
  expect(config).toMatchObject({
    foo: 1,
    nest: 4,
    local: 4,
    alias: {
      '@': 'cwd-1-config',
      src: 'absSrcPath-2-config',
      tmp: 'absTmpPath-5-config',
    },
  });
});
