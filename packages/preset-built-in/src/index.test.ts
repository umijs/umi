import { Service } from '@umijs/core';
import { join } from 'path';
import { render, cleanup } from '@testing-library/react';
import { rimraf } from '@umijs/utils';
import { readFileSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

afterEach(cleanup);

test('api.writeTmpFile error in register stage', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin-error'))],
  });
  await expect(service.init()).rejects.toThrow(
    /api.writeTmpFile\(\) should not execute in register stage./,
  );
});

test('api.writeTmpFile', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin'))],
  });
  await service.run({
    name: 'foo',
    args: {},
  });
  const tmpFile = join(cwd, '.umi-test', 'foo');
  expect(readFileSync(tmpFile, 'utf-8')).toEqual('foo');
  rimraf.sync(tmpFile);
});

test('global js', async () => {
  const cwd = join(fixtures, 'global-files');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
  const reactNode = require(join(cwd, 'src', '.umi-test', 'umi.ts')).default;
  const { container } = render(reactNode);
  expect(container.textContent).toEqual('hello Global');
});
