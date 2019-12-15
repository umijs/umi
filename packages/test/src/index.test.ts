import { join } from 'path';
import mockedJest from 'jest';
import umiTest from './index';

const fixtures = join(__dirname, 'fixtures');

test('version', async () => {
  const spy = jest.spyOn(global.console, 'log').mockImplementation();
  await umiTest({
    version: true,
  });
  expect(spy.mock.calls).toEqual([['umi-test@0.0.1-alpha.1'], ['jest@24.9.0']]);
  spy.mockRestore();
});

test('run jest', async () => {
  // @ts-ignore
  const spy = jest.spyOn(mockedJest, 'runCLI').mockResolvedValue({
    results: {
      success: true,
    },
  });
  await umiTest({
    cwd: join(fixtures, 'normal'),
  });
  spy.mockRestore();
});
