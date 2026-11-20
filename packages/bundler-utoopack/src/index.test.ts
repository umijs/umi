import {
  createDevStatsFromClientPaths,
  isUtoopackProxyStartupError,
} from './index';

describe('createDevStatsFromClientPaths', () => {
  test('creates lightweight compatible stats for each entry', () => {
    const stats = createDevStatsFromClientPaths(
      ['runtime.js', 'umi.css', 'runtime.js'],
      ['umi', 'admin'],
    );

    expect(stats.assets).toEqual([{ name: 'runtime.js' }, { name: 'umi.css' }]);
    expect(stats.entrypoints.umi).toEqual({
      assets: stats.assets,
      chunks: [],
    });
    expect(stats.entrypoints.admin).toEqual({
      assets: stats.assets,
      chunks: [],
    });
    expect(stats.chunks).toEqual([]);
    expect(stats.modules).toEqual([]);
    expect(stats.hasErrors()).toBe(false);
    expect(stats.toJson()).toBe(stats);
    expect(Object.keys(stats.compilation.assets)).toEqual([
      'runtime.js',
      'umi.css',
    ]);
  });

  test('creates compatible empty stats when client paths are missing', () => {
    const stats = createDevStatsFromClientPaths(undefined, ['umi']);

    expect(stats.assets).toEqual([]);
    expect(stats.entrypoints.umi).toEqual({ assets: [], chunks: [] });
    expect(stats.compilation.assets).toEqual({});
    expect(stats.hasErrors()).toBe(false);
    expect(stats.toJson()).toBe(stats);
  });
});

describe('isUtoopackProxyStartupError', () => {
  test('matches ECONNREFUSED from the utoopack dev server port', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(true);
  });

  test('does not match other ports', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 9001,
        },
        8001,
      ),
    ).toBe(false);
  });

  test('does not match other proxy errors', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNRESET',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(false);
  });
});
