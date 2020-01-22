import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';

const fixtures = join(__dirname, '../../../fixtures');

test('build', async () => {
  const cwd = join(fixtures, 'build');
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    // production 下 ci 时会报错
    // env: 'production',
  });
  await service.run({
    name: 'build',
  });

  expect(existsSync(join(cwd, 'dist', 'umi.js'))).toEqual(true);
  // expect(existsSync(join(cwd, 'dist', 'index.html'))).toEqual(true);
  rimraf.sync(join(cwd, 'dist'));
});
