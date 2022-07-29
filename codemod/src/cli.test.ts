import { fsExtra, logger, rimraf } from '@umijs/utils';
import { join } from 'path';
import cli from './cli';
import { getContent } from './utils/getContent';

test('normal', async () => {
  // test setup
  const fixtureDir = join(__dirname, '../fixtures');
  const tmpDir = join(fixtureDir, 'tmp');
  logger.info('copy fixtures/origin > fixtures/tmp');
  rimraf.sync(tmpDir);
  fsExtra.copySync(join(fixtureDir, 'origin'), tmpDir);
  const old = process.argv;
  const bacon = process.env.BACON;
  const gitCheck = process.env.GIT_CHECK;
  process.argv = ['--cwd', 'fixtures/tmp'];
  process.env.BACON = 'none';
  process.env.GIT_CHECK = 'none';
  await cli();
  process.argv = old;
  process.env.BACON = bacon;
  process.env.GIT_CHECK = gitCheck;
  const configCode = getContent(tmpDir, 'config/config.ts');
  expect(configCode.includes(`dynamicImportSyntax`)).toBe(false);
  expect(configCode.includes(`runtimePublicPath: {}`)).toBe(true);
  expect(configCode.includes(`configProvider: {}`)).toBe(true);
});
