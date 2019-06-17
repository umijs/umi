import { join } from 'path';
import blockPlugin from './index';

class MockGenerator {
  constructor(args, opts) {
    this._opts = opts;
  }

  run() {
    this.entryPath = join(__dirname, '../../../fixtures/block/antdpro/pages/index.js');
    this.blockFolderName = 'DemoTest';
  }

  on() {}
}

describe('umi block', () => {
  xit('run block command right', async () => {
    const commandFn = jest.fn();
    const routeConfigFn = jest.fn();
    let commandHandler = null;
    const mockApi = {
      service: {
        userConfig: {
          file: '/testpath',
        },
      },
      config: {
        routes: [],
      },
      log: {
        error: e => {
          console.error(e);
        },
        success: () => {},
      },
      applyPlugins: (name, { initialValue }) => {
        if (name === '_modifyBlockNewRouteConfig') {
          routeConfigFn(initialValue);
        }
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

    const { ctx, generator } = await commandHandler({
      path: 'Test/NewPage',
      page: true,
      layout: true,
      dryRun: true,
      _: ['add', join(__dirname, '../../../fixtures/block/test-blocks/demo-with-dependencies')],
    });
    expect(ctx.isLocal).toEqual(true);
    expect(ctx.routePath).toEqual('/Test/NewPage');
    expect(ctx.pkg.name).toEqual('@umi-blocks/DemoWithDependencies');
    expect(generator._opts.isPageBlock).toEqual(true);
    expect(routeConfigFn).toBeCalledWith({
      component: './Test/NewPage',
      path: '/test/newpage',
      routes: [],
    });

    const { ctx: ctx2, generator: generator2 } = await commandHandler({
      path: 'Test/NewPage',
      dryRun: true,
      _: ['add', join(__dirname, '../../../fixtures/block/test-blocks/demo-with-dependencies')],
    });
    expect(ctx2.isLocal).toEqual(true);
    expect(ctx2.routePath).toEqual('/Test/NewPage');
    expect(ctx2.pkg.name).toEqual('@umi-blocks/DemoWithDependencies');
    expect(generator2._opts.isPageBlock).toEqual(false);
  });
});
