import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';

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
  expect(existsSync(join(cwd, 'dist', 'umi.js'))).toEqual(true);
  expect(existsSync(join(cwd, 'dist', 'index.html'))).toEqual(true);
  rimraf.sync(join(cwd, 'dist'));
});
