import { join } from 'path';

const fixtures = join(__dirname, 'fixtures');

beforeEach(() => {
  jest.resetModules();
});

test('version', async () => {
  const spy = jest.spyOn(global.console, 'log').mockImplementation();
  // @ts-ignore
  const { default: umiTest } = await import('./index');
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
  const argsArr: object[] = [];
  jest.doMock('jest', () => {
    return {
      __esModule: true,
      async runCLI(args: object) {
        argsArr.push(args);
        return {
          results: { success: true },
        };
      },
    };
  });
  // @ts-ignore
  const { default: umiTest } = await import('./index');
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

  // @ts-ignore
  expect(argsArr[0].notify).toEqual('notify');
  // @ts-ignore
  expect(argsArr[0].updateSnapshot).toEqual(true);
  // @ts-ignore
  expect(argsArr[0].config).toContain('"bar":1,"hoo":2,"foo":1');
});
