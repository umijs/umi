import { Service } from '@umijs/core';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');
const cwd = join(fixtures, 'generate');

async function runGenerator(args: any) {
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
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
  expect(existsSync(join(cwd, 'pages', 'index.js'))).toEqual(true);
  expect(existsSync(join(cwd, 'pages', 'index.css'))).toEqual(true);
  rimraf.sync(join(cwd, 'pages'));
});

test('generate page with typescript and less', async () => {
  await runGenerator({
    _: ['generate', 'page', 'index'],
    typescript: true,
    less: true,
  });
  expect(existsSync(join(cwd, 'pages', 'index.tsx'))).toEqual(true);
  expect(existsSync(join(cwd, 'pages', 'index.less'))).toEqual(true);
  rimraf.sync(join(cwd, 'pages'));
});

test('generate tmp', async () => {
  await runGenerator({
    _: ['generate', 'tmp'],
  });
  expect(existsSync(join(cwd, '.umi-test'))).toEqual(true);
  rimraf.sync(join(cwd, '.umi-test'));
});

test('Generator not found', async () => {
  await expect(
    runGenerator({
      _: ['generate', 'foo'],
    }),
  ).rejects.toThrow(/Generator foo not found/);
});
