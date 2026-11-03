import {
  extractEntryAssets,
  extractEntryPointFilesFromStats,
  getUmiEntryFilesFromStats,
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

test.each([false, true])(
  'uses Utoopack/Mako entrypoint files without lazy assets (compilation=%s)',
  (inCompilation) => {
    const stats = {
      entrypoints: {
        umi: {
          assets: [{ name: 'entry_runtime.js' }, 'assets/umi.js'],
          chunks: ['assets/umi.js', 'assets/umi.css', '_project.css'],
        },
      },
      chunks: [
        { id: 'assets/umi.js', entry: false, files: ['assets/umi.js'] },
        { id: 'assets/umi.css', entry: false, files: ['assets/umi.css'] },
        { id: '_project.css', entry: false, files: ['_project.css'] },
        { id: 'lazy/umi.js', entry: false, files: ['lazy/umi.js'] },
      ],
      compilation: {
        assets: {
          'assets/umi.js': {},
          'assets/umi.css': {},
          'entry_runtime.js': {},
          '_project.css': {},
          'lazy/umi.js': {},
        },
      },
    };
    const files = extractEntryPointFilesFromStats(stats);
    const entryFiles = getUmiEntryFilesFromStats(
      inCompilation ? { compilation: stats } : stats,
    );
    expect(entryFiles).toEqual(['assets/umi.js', 'assets/umi.css']);
    expect(extractEntryAssets(files, entryFiles)).toEqual({
      js: ['entry_runtime.js'],
      css: ['_project.css'],
    });
  },
);

test('excludes only the exact main files and keeps dependencies named umi', () => {
  expect(
    extractEntryAssets(
      [
        'vendor/umi.js',
        'vendor/umi.css',
        'assets/umi.js',
        'assets/umi.css',
        'assets/umi.mjs',
      ],
      ['assets/umi.js', 'assets/umi.css'],
    ),
  ).toEqual({
    js: ['vendor/umi.js', 'assets/umi.mjs'],
    css: ['vendor/umi.css'],
  });
});

test('does not infer ambiguous nested files when entry metadata is unavailable', () => {
  expect(
    getUmiEntryFilesFromStats({
      compilation: {
        assets: {
          'assets/umi.js': {},
          'lazy/umi.js': {},
          'assets/umi.css': {},
        },
      },
    }),
  ).toEqual(['assets/umi.css']);
});
