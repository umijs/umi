import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf } from '@umijs/utils/src';
import { existsSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
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
});
