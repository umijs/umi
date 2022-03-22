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

test('config umi-env-dot-env', async () => {
  const service = buildService({ name: 'umi-env-dot-env' });
  const userConfig = await service.run({ name: 'userConfig' });
  expect(userConfig).toEqual({
    bar: 2,
    foo: 3,
    nest: 4,
  });
});
