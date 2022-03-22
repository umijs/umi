import { join } from 'path';
import { Service } from '../service/service';
import { Env } from '../types';

const base = join(__dirname, 'fixtures');

function buildService(opts: { name: string }) {
  const cwd = join(base, opts.name);
  return new Service({
    cwd,
    env: Env.development,
    defaultConfigFiles: ['.umirc.ts', 'config/config.ts'],
    plugins: [require.resolve(join(cwd, 'plugin.ts'))],
  });
}

test('normal', async () => {
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

test('umi-env', async () => {
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
});

test('umi-env-dot-env', async () => {
  const service = buildService({ name: 'umi-env-dot-env' });
  const userConfig = await service.run({ name: 'userConfig' });

  expect(userConfig).toEqual({
    bar: 2,
    foo: 3,
    nest: 4,
  });
});
