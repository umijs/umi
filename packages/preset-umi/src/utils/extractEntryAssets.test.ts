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
