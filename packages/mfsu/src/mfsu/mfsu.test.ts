import path from 'path';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
import { resolvePublicPath, MFSU } from './mfsu';

const webpackBaseContext = path.join(__dirname, '../../');

test('resolvePublicPath if no output', () => {
  expect(resolvePublicPath({})).toStrictEqual('/');
});

test('resolvePublicPath if no publicPath', () => {
  expect(
    resolvePublicPath({
      output: {},
    }),
  ).toStrictEqual('/');
});

test('resolvePublicPath has publicPath', () => {
  expect(
    resolvePublicPath({
      output: {
        publicPath: 'custom',
      },
    }),
  ).toStrictEqual('custom');
});

describe('mfsu', () => {
  let mfsu: MFSU;

  beforeEach(() => {
    mfsu = new MFSU({
      implementor: webpack as any,
      buildDepWithESBuild: true,
      depBuildConfig: null,
      startBuildWorker: null as any,
    });
  });

  test('setWebpackConfig throw Error if entry not exist', async () => {
    expect(
      mfsu.setWebpackConfig({
        config: {
          entry: './fixtures/not-exist',
          context: webpackBaseContext,
        },
        depConfig: {},
      }),
    ).rejects.toThrow();
  });

  // make sure context has a non-undefined value
  test('setWebpackConfig without specific context throw Error if entry not exist', async () => {
    expect(
      mfsu.setWebpackConfig({
        config: {
          entry: './fixtures/not-exist',
        },
        depConfig: {},
      }),
    ).rejects.toThrow(/Can't resolve '.\/fixtures\/not-exist'/);
  });

  test('setWebpackConfig normalize relative path', async () => {
    const config = {
      entry: './fixtures/entry/',
      context: webpackBaseContext,
    };
    await mfsu.setWebpackConfig({
      config,
      depConfig: {},
    });

    expect(config.entry).toStrictEqual({
      default: './mfsu-virtual-entry/default.js',
    });
  });

  test('setWebpackConfig normalize absolute path', async () => {
    const config = {
      entry: path.join(webpackBaseContext, './fixtures/entry/'),
      context: webpackBaseContext,
    };
    await mfsu.setWebpackConfig({
      config,
      depConfig: {},
    });

    expect(config.entry).toStrictEqual({
      default: './mfsu-virtual-entry/default.js',
    });
  });

  test('setWebpackConfig normalize relative path base config.context', async () => {
    mfsu = new MFSU({
      implementor: webpack as any,
      buildDepWithESBuild: true,
      depBuildConfig: null,
      startBuildWorker: null as any,
    });

    const config = {
      entry: './entry',
      context: path.resolve(webpackBaseContext, './fixtures'),
    };

    await mfsu.setWebpackConfig({
      config,
      depConfig: {},
    });

    expect(config.entry).toStrictEqual({
      default: './mfsu-virtual-entry/default.js',
    });
  });

  test('setWebpackConfig normalize entry Object', async () => {
    const config = {
      entry: {
        index: './fixtures/entry',
        main: './fixtures/entry/main',
      },
      context: webpackBaseContext,
    };
    await mfsu.setWebpackConfig({
      config,
      depConfig: {},
    });

    expect(config.entry).toStrictEqual({
      index: './mfsu-virtual-entry/index.js',
      main: './mfsu-virtual-entry/main.js',
    });
  });
});
