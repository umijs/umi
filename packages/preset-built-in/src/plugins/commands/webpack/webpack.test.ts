import { Service } from '@umijs/core';
import { mockConsole } from '@umijs/test';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');

test('webpack', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      print: false,
    },
  });
  // @ts-ignore
  expect(config.mode).toEqual('development');
});

test('webpack in production', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    env: 'production',
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      print: false,
    },
  });
  // @ts-ignore
  expect(config.mode).toEqual('production');
});

test('webpack in test', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    env: 'test',
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      print: false,
    },
  });
  // @ts-ignore
  expect(config.mode).toEqual('development');
});

test('webpack with plugins', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      plugins: true,
      print: false,
    },
  });
  expect(config).toContain('define');
});

test('webpack with plugin', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      plugin: 'define',
      print: false,
    },
  });
  // @ts-ignore
  expect(config.definitions['process.env'].NODE_ENV).toContain('test');
});

test('webpack with rules', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      rules: true,
      print: false,
    },
  });
  expect(config).toContain('js');
});

test('webpack with rule', async () => {
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      rule: 'js',
      print: false,
    },
  });
  // @ts-ignore
  expect(config.test).toEqual(/\.(js|mjs|jsx|ts|tsx)$/);
});

test('inpect + print', async () => {
  const reset = mockConsole();
  const cwd = join(fixtures, 'webpack');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  await service.run({
    name: 'webpack',
    args: {
      plugins: true,
    },
  });
  reset();
  expect(reset.messages[0][1]).toContain('define');
});
