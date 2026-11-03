import { getAssetsMap } from './getAssetsMap';

test.each([
  ['umi.js', 'umi.css'],
  ['umi.12345678.js', 'umi.12345678.css'],
  ['assets/umi.js', 'assets/umi.css'],
  ['assets/umi.12345678.js', 'assets/umi.12345678.css'],
  ['assets/js/umi.12345678.js', 'assets/css/umi.12345678.css'],
  ['assets\\js\\umi.12345678.js', 'assets\\css\\umi.12345678.css'],
])('preserves emitted paths for %s', (js, css) => {
  const stats = {
    compilation: {
      assets: Object.fromEntries([js, css].map((name) => [name, {}])),
    },
  };
  expect(getAssetsMap({ stats, publicPath: '/cdn/' })).toEqual({
    'umi.js': [`/cdn/${js}`],
    'umi.css': [`/cdn/${css}`],
  });
});

test.each([false, true])(
  'supports MultiStats=%s without unrelated assets',
  (multi) => {
    const names = [
      'assets/umi.12345678.js',
      'assets/umi.12345678.hot-update.js',
      'assets/vendor.js',
      'assets/umi-dir/vendor.js',
      'assets/umi.js/vendor.js',
      'assets/umi.mjs',
    ];
    const stats = {
      compilation: {
        assets: Object.fromEntries(names.map((name) => [name, {}])),
      },
    };
    expect(
      getAssetsMap({
        stats: multi ? { stats: [stats] } : stats,
        publicPath: 'auto',
      }),
    ).toEqual({ 'umi.js': ['/assets/umi.12345678.js'] });
  },
);

test.each([false, true])(
  'uses the umi entry chunk with separate runtime and vendor chunks (JSON=%s)',
  (json) => {
    const files = ['assets/umi.12345678.js', 'assets/umi.12345678.css'];
    const unrelated = [
      'vendor/umi.js',
      'lazy/umi.async.js',
      'copied/umi.css',
      'assets/umi.12345678.js.map',
    ];
    const assets = Object.fromEntries(
      [...files, ...unrelated].map((name) => [name, {}]),
    );
    const stats = json
      ? {
          compilation: {
            assets,
            entrypoints: {
              umi: { chunks: ['runtime', 'vendors', 'umi'] },
            },
            chunks: [
              { id: 'runtime', entry: true, files: ['runtime.js'] },
              { id: 'vendors', files: ['vendor/umi.js'] },
              { id: 'umi', entry: false, files },
            ],
          },
        }
      : {
          compilation: {
            assets,
            entrypoints: new Map([
              [
                'umi',
                {
                  getEntrypointChunk: () => ({ files: new Set(files) }),
                  getFiles: () => ['runtime.js', 'vendor/umi.js', ...files],
                },
              ],
            ]),
          },
        };
    expect(
      getAssetsMap({ stats, publicPath: 'https://cdn.example.com/' }),
    ).toEqual({
      'umi.js': [`https://cdn.example.com/${files[0]}`],
      'umi.css': [`https://cdn.example.com/${files[1]}`],
    });
  },
);

test('preserves legacy flat entries when unrelated nested assets follow them', () => {
  const stats = {
    compilation: {
      assets: {
        'umi.js': {},
        'umi.css': {},
        'lazy/umi.async.js': {},
        'copied/umi.css': {},
      },
    },
  };
  expect(getAssetsMap({ stats, publicPath: '/' })).toEqual({
    'umi.js': ['/umi.js'],
    'umi.css': ['/umi.css'],
  });
});

test.each([{}, new Map()])(
  'does not infer an entry from unrelated assets when entrypoints are known',
  (entrypoints) => {
    expect(
      getAssetsMap({
        stats: { compilation: { entrypoints, assets: { 'lazy/umi.js': {} } } },
        publicPath: '/',
      }),
    ).toEqual({});
  },
);
