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
