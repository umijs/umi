import { Service } from '@umijs/core';
import { join } from 'path';
import * as acorn from 'acorn';
import { rimraf } from '@umijs/utils';
import { readFileSync, existsSync } from 'fs';

const fixtures = join(__dirname, '../../../fixtures');
const cwd = join(fixtures, 'build');

beforeAll(async () => {
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    env: 'production',
  });
  await service.run({
    name: 'build',
  });
});

test('build', async () => {
  const umiPath = join(cwd, 'dist', 'umi.js');
  expect(existsSync(umiPath)).toEqual(true);
  expect(existsSync(join(cwd, 'dist', 'index.html'))).toEqual(true);
  const distJs = readFileSync(umiPath, 'utf-8');

  // output es5 if config `targets: { ie: 11 }`
  expect(() =>
    acorn.parse(distJs, {
      ecmaVersion: 5,
    }),
  ).not.toThrowError();
  rimraf.sync(join(cwd, 'dist'));
});
