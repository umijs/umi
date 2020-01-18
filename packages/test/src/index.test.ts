import { join } from 'path';
import mockedJest from 'jest';
import umiTest from './index';

const fixtures = join(__dirname, 'fixtures');

test('version', async () => {
  const spy = jest.spyOn(global.console, 'log').mockImplementation();
  await umiTest({
    version: true,
  });
  expect(spy.mock.calls).toEqual([
    [`umi-test@${require('../package.json').version}`],
    [`jest@${require('jest/package.json').version}`],
  ]);
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
    // for coverage
    debug: true,
    // @ts-ignore
    // alias
    u: true,
    // CliOptions
    notify: true,
  });
  expect(spy.mock.calls[0][0].notify).toEqual('notify');
  expect(spy.mock.calls[0][0].updateSnapshot).toEqual(true);
  expect(spy.mock.calls[0][0].config).toContain('"bar":1,"hoo":2,"foo":1');
  spy.mockRestore();
});
