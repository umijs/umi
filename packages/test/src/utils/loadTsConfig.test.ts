import { default as loadTSConfigFile } from './loadTsConfig';
import { join } from 'path';

const fixtures = join(__dirname, '..', 'fixtures');
const cwd = join(fixtures, 'normal');

test('test loadTsConfigError when ts-node is not installed', async () => {
  // mock ts-node is undefined
  jest.mock('ts-node', () => ({}));

  const userJestConfigTsFile = join(cwd, 'jest.config.ts');
  await expect(loadTSConfigFile(userJestConfigTsFile)).rejects.toThrow();

  jest.clearAllMocks();
});
