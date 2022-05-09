import rollup from './rollup';

test('empty config', () => {
  expect(rollup({}, {}).build).toEqual({
    rollupOptions: {
      plugins: [],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  });
});

test('config analyze', () => {
  const plugins = rollup({ analyze: {} }, {}).build.rollupOptions.plugins;
  expect(plugins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'visualizer' })]),
  );
});

test('config copy', () => {
  const plugins = rollup({ copy: [] }, {}).build.rollupOptions.plugins;
  expect(plugins).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'copy' })]),
  );
});

test('config hash', () => {
  const build = rollup({ hash: true }, {}).build;
  expect(build).toEqual({
    rollupOptions: {
      plugins: [],
      output: {},
    },
  });
});
