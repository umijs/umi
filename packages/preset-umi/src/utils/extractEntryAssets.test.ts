import {
  extractEntryAssets,
  extractEntryPointFilesFromStats,
} from './extractEntryAssets';

test('extractEntryPointFilesFromStats includes entrypoint assets', () => {
  const files = extractEntryPointFilesFromStats({
    entrypoints: {
      umi: {
        assets: [
          { name: '_project___0a0d53fb.05e0d5fb.css' },
          { name: '_project___76bef3ab.cf435efa.css' },
          { name: 'umi.429d95d4.js' },
        ],
        chunks: ['umi.429d95d4.js'],
      },
    },
    chunks: [{ id: 'umi.429d95d4.js', files: ['umi.429d95d4.js'] }],
  });

  expect(files).toEqual([
    '_project___0a0d53fb.05e0d5fb.css',
    '_project___76bef3ab.cf435efa.css',
    'umi.429d95d4.js',
  ]);

  expect(extractEntryAssets(files).css).toEqual([
    '_project___0a0d53fb.05e0d5fb.css',
    '_project___76bef3ab.cf435efa.css',
  ]);
});

test('extractEntryPointFilesFromStats includes chunk files', () => {
  expect(
    extractEntryPointFilesFromStats({
      entrypoints: {
        umi: {
          assets: [],
          chunks: ['umi'],
        },
      },
      chunks: [{ id: 'umi', files: ['umi.js', 'umi.css'] }],
    }),
  ).toEqual(['umi.js', 'umi.css']);
});

test.each(['', 'assets/', 'assets/js/', 'assets\\js\\'])(
  'classifies entry assets under %s without changing chunk paths',
  (prefix) => {
    const vendor = `${prefix}vendor.js`;
    const module = `${prefix}umi.mjs`;
    const css = `${prefix}vendor.css`;
    expect(
      extractEntryAssets([
        `${prefix}umi.js`,
        `${prefix}umi.12345678.js`,
        `${prefix}umi.css`,
        `${prefix}umi.12345678.css`,
        vendor,
        vendor,
        module,
        css,
        `${prefix}umi.12345678.hot-update.js`,
        `${prefix}vendor.hot-update.js`,
        `${prefix}image.png`,
        `${prefix}umi-dir/vendor.js`,
        `${prefix}umi.js/vendor.js`,
      ]),
    ).toEqual({
      js: [
        vendor,
        module,
        `${prefix}umi-dir/vendor.js`,
        `${prefix}umi.js/vendor.js`,
      ],
      css: [css],
    });
  },
);
