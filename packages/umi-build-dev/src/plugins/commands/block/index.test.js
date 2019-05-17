import { join } from 'path';
import blockPlugin from './index';

class MockGenerator {
  run() {}

  on() {}
}

describe('umi block', () => {
  it('run block command right', async () => {
    const commandFn = jest.fn();
    let commandHandler = null;
    const mockApi = {
      config: {},
      log: {
        error: e => {
          console.error(e);
        },
        success: () => {},
      },
      applyPlugins: (name, { initialValue }) => {
        return initialValue;
      },
      Generator: MockGenerator,
      debug: () => {},
      paths: {
        cwd: join(__dirname, '../../../fixtures/block/antdpro'),
      },
      registerCommand: (cmd, info, handler) => {
        commandFn(cmd);
        commandHandler = handler;
      },
      _registerConfig: () => {},
    };

    blockPlugin(mockApi);
    expect(commandFn).toBeCalledWith('block');

    const ctx = await commandHandler({
      path: 'Test/NewPage',
      wrap: false,
      dryRun: true,
      _: [
        'add',
        join(
          __dirname,
          '../../../fixtures/block/test-blocks/demo-with-dependencies',
        ),
      ],
    });
    expect(ctx.isLocal).toEqual(true);
    expect(ctx.routePath).toEqual('/Test/NewPage');
    expect(ctx.pkg.name).toEqual('@umi-blocks/DemoWithDependencies');
  });
});
