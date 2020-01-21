import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

test('build', async () => {
  const cwd = join(fixtures, 'build');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'build',
  });

  const absTmpDir = join(cwd, '.umi-test');
  expect(existsSync(join(absTmpDir, 'umi.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/history.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/plugin.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/routes.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/umiExports.ts'))).toEqual(true);
  rimraf.sync(join(absTmpDir));
  expect(existsSync(join(cwd, 'dist', 'umi.js'))).toEqual(true);
  rimraf.sync(join(cwd, 'dist'));
});
