import { Service } from '@umijs/core';
import { mockConsole } from '@umijs/test';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');

test('inspect', async () => {
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'inspect',
    args: {
      print: false,
    },
  });
  // @ts-ignore
  expect(config.mode).toEqual('development');
});

test('inspect with plugins', async () => {
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'inspect',
    args: {
      plugins: true,
      print: false,
    },
  });
  expect(config).toContain('define');
});

test('inspect with plugin', async () => {
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'inspect',
    args: {
      plugin: 'define',
      print: false,
    },
  });
  // @ts-ignore
  expect(config.definitions['process.env'].NODE_ENV).toContain('development');
});

test('inspect with rules', async () => {
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'inspect',
    args: {
      rules: true,
      print: false,
    },
  });
  expect(config).toContain('js');
});

test('inspect with rule', async () => {
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  const config = await service.run({
    name: 'inspect',
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
  const cwd = join(fixtures, 'inspect');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
  });
  await service.run({
    name: 'inspect',
    args: {
      plugins: true,
    },
  });
  reset();
  expect(reset.messages[0][1]).toContain('define');
});
