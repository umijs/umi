import { fsExtra, logger, rimraf } from '@umijs/utils';
import { join } from 'path';
import { prepare } from '../prepare';
import { Context } from '../types';
import { getContent } from '../utils/getContent';
import { Runner } from './config';

test('normal', async () => {
  // test setup
  const fixtureDir = join(__dirname, '../../fixtures/config');
  const tmpDir = join(fixtureDir, 'tmp');
  logger.info('copy fixtures/config/normal > fixtures/config/tmp');
  rimraf.sync(tmpDir);
  fsExtra.copySync(join(fixtureDir, 'normal'), tmpDir);
  const context: Context = await prepare({
    cwd: tmpDir,
    pattern: 'src/**/*.{js,jsx,ts,tsx}',
  });
  new Runner({ cwd: tmpDir, context }).run();
  const configCode = getContent(tmpDir, 'config/config.ts');
  expect(configCode.includes(`dynamicImportSyntax`)).toBe(false);
  expect(configCode.includes(`runtimePublicPath: {}`)).toBe(true);
  expect(configCode.includes(`configProvider: {}`)).toBe(true);
});
