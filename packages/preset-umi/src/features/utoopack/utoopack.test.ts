import type { IApi } from '../../types';
import utoopack from './utoopack';

test('onDevCompileDone replaces obsolete HTML assets with the current entry assets', () => {
  const api = {
    describe: jest.fn(),
    onCheck: jest.fn(),
    modifyAppData: jest.fn(),
    modifyConfig: jest.fn(),
    onStart: jest.fn(),
    onDevCompileDone: jest.fn(),
    onBuildComplete: jest.fn(),
    addHTMLStyles: jest.fn(),
    addHTMLHeadScripts: jest.fn(),
    config: { publicPath: '/static/' },
    userConfig: { utoopack: {} },
  };
  utoopack(api as unknown as IApi);
  const compile = api.onDevCompileDone.mock.calls[0][0];
  const getStyles = api.addHTMLStyles.mock.calls[0][0];
  const getScripts = api.addHTMLHeadScripts.mock.calls[0][0];
  const stats = (files: string[]) => ({
    entrypoints: {
      umi: { assets: files, chunks: [] },
      admin: { assets: ['admin.js', 'admin.css'], chunks: [] },
    },
    chunks: [],
  });

  compile({
    stats: stats([
      'umi.old.js',
      'umi.old.css',
      'runtime.old.js',
      'runtime.old.js',
      'shared.mjs',
      'chunk.old.css',
      'runtime.hot-update.js',
    ]),
  });
  expect(getScripts()).toEqual([
    { src: '/static/runtime.old.js' },
    { src: '/static/shared.mjs' },
  ]);
  expect(getStyles()).toEqual([{ src: '/static/chunk.old.css' }]);

  compile({ stats: stats(['umi.new.js', 'runtime.new.js']) });
  expect(getScripts()).toEqual([{ src: '/static/runtime.new.js' }]);
  expect(getStyles()).toEqual([]);

  // Repeated output must not add duplicate script tags.
  compile({ stats: stats(['umi.new.js', 'runtime.new.js']) });
  expect(getScripts()).toEqual([{ src: '/static/runtime.new.js' }]);
});

test('onBuildComplete retains assets from earlier production compilations', () => {
  const api = {
    describe: jest.fn(),
    onCheck: jest.fn(),
    modifyAppData: jest.fn(),
    modifyConfig: jest.fn(),
    onStart: jest.fn(),
    onDevCompileDone: jest.fn(),
    onBuildComplete: jest.fn(),
    addHTMLStyles: jest.fn(),
    addHTMLHeadScripts: jest.fn(),
    config: { publicPath: '/static/' },
    userConfig: { utoopack: {} },
  };
  utoopack(api as unknown as IApi);
  const build = api.onBuildComplete.mock.calls[0][0];
  const getStyles = api.addHTMLStyles.mock.calls[0][0];
  const getScripts = api.addHTMLHeadScripts.mock.calls[0][0];
  const stats = (files: string[]) => ({
    entrypoints: { umi: { assets: files, chunks: [] } },
    chunks: [],
  });

  build({ stats: stats(['umi.js', 'client-runtime.js', 'client.css']) });
  build({ stats: stats(['umi.js', 'server-runtime.js', 'server.css']) });

  expect(getScripts()).toEqual([
    { src: '/static/client-runtime.js' },
    { src: '/static/server-runtime.js' },
  ]);
  expect(getStyles()).toEqual([
    { src: '/static/client.css' },
    { src: '/static/server.css' },
  ]);
});
