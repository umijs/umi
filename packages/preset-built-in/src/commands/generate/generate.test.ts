import { Env, Service } from '@umijs/core';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');
const cwd = join(fixtures, 'generate');
async function runGenerator(args: any) {
  const service = new Service({
    cwd,
    env: Env.test,
    plugins: [require.resolve('./generate')],
  });
  await service.run({
    name: 'generate',
    args,
  });
}

test('generate page', async () => {
  await runGenerator({
    _: ['generate', 'page', 'index'],
  });
  expect(existsSync(join(cwd, 'pages', 'index', 'index.tsx'))).toEqual(true);
  expect(existsSync(join(cwd, 'pages', 'index', 'index.css'))).toEqual(true);
  rimraf.sync(join(cwd, 'pages'));
});

test('Generator not found', async () => {
  await expect(
    runGenerator({
      _: ['generate', 'foo'],
    }),
  ).rejects.toThrow(/Generator foo not found/);
});
