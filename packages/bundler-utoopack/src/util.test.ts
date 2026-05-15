import { stripAnsi } from '@umijs/utils';
import {
  getBuildBanner,
  getCssOutputFilenames,
  getDevBanner,
  getSSRCssSplitChunks,
} from './util';

class MiniCssExtractPlugin {
  options: { filename?: string; chunkFilename?: string };

  constructor(options: { filename?: string; chunkFilename?: string }) {
    this.options = options;
  }
}

describe('getDevBanner', () => {
  const originalVersion = process.env.UTOOPACK_VERSION;

  afterEach(() => {
    if (originalVersion) {
      process.env.UTOOPACK_VERSION = originalVersion;
    } else {
      delete process.env.UTOOPACK_VERSION;
    }
  });

  test('prints the utoopack ready banner in vite style', () => {
    const banner = stripAnsi(
      getDevBanner({
        protocol: 'http:',
        host: '0.0.0.0',
        port: 8000,
        ip: '30.172.96.210',
        packVersion: '1.3.11',
        duration: 1289,
      }),
    );

    expect(banner).toContain('utoo pack v1.3.11 ready in 1289ms');
    expect(banner).toContain('➜  Local:   http://localhost:8000');
    expect(banner).toContain('➜  Network: http://30.172.96.210:8000');
  });

  test('prints the utoopack build banner in a concise style', () => {
    const banner = stripAnsi(
      getBuildBanner({
        packVersion: '1.3.11',
        duration: 2345,
        outputPath: 'dist',
        assetCount: 6,
      }),
    );

    expect(banner).toContain('utoo pack v1.3.11 built in 2345ms');
    expect(banner).toContain('➜  Output:  dist');
    expect(banner).toContain('➜  Assets:  6 files');
  });
});

describe('getCssOutputFilenames', () => {
  test('returns default css output filename placeholders', () => {
    expect(
      getCssOutputFilenames({
        entry: {
          index: './src/index.tsx',
        },
        config: {},
        webpackConfig: {
          webpackMode: true,
        },
        useHash: false,
      }),
    ).toEqual({
      cssFilename: '[name].css',
      cssChunkFilename: '[name].chunk.css',
    });
  });

  test('returns hashed default css output filenames', () => {
    expect(
      getCssOutputFilenames({
        entry: {
          index: './src/index.tsx',
        },
        config: {
          hash: true,
        },
        webpackConfig: {
          webpackMode: true,
        },
        useHash: true,
      }),
    ).toEqual({
      cssFilename: '[name].[contenthash:8].css',
      cssChunkFilename: '[name].[contenthash:8].chunk.css',
    });
  });

  test('returns ssr css output filenames', () => {
    expect(
      getCssOutputFilenames({
        entry: {
          index: './src/index.tsx',
        },
        config: {
          ssr: {},
        },
        webpackConfig: {
          webpackMode: true,
        },
        useHash: false,
      }),
    ).toEqual({
      cssFilename: 'index.css',
      cssChunkFilename: 'umi.css',
    });
  });

  test('uses mini-css-extract templates from webpack config', () => {
    expect(
      getCssOutputFilenames({
        entry: {
          index: './src/index.tsx',
        },
        config: {},
        webpackConfig: {
          webpackMode: true,
          plugins: [
            new MiniCssExtractPlugin({
              filename: 'css/[name].[hash:8].css',
              chunkFilename: 'css/[name].[chunkhash:8].async.css',
            }),
          ],
        },
        useHash: false,
      }),
    ).toEqual({
      cssFilename: 'css/[name].[contenthash:8].css',
      cssChunkFilename: 'css/[name].[contenthash:8].async.css',
    });
  });
});

describe('getSSRCssSplitChunks', () => {
  test('returns empty config for non-ssr builds', () => {
    expect(getSSRCssSplitChunks({})).toEqual({});
  });

  test('returns css split chunk config for ssr builds', () => {
    expect(getSSRCssSplitChunks({ ssr: {} })).toEqual({
      splitChunks: {
        css: {
          minChunkSize: 100_000_000,
          maxChunkCountPerGroup: 1,
          maxMergeChunkSize: 100_000_000,
        },
      },
    });
  });
});
