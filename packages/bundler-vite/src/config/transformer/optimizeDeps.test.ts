import IConfigProcessor from './optimizeDeps';

test('optimizeDeps entry config', () => {
  const optimizeDeps = IConfigProcessor(
    {
      alias: {},
      entry: { config: 'myentry' },
    },
    {},
  ).optimizeDeps;
  expect(optimizeDeps).toEqual(
    expect.objectContaining({
      entries: ['myentry'],
      include: [],
    }),
  );
});

test('alias config', () => {
  const include = IConfigProcessor(
    {
      alias: {
        alias_config: 'node_modules',
      },
      entry: {},
    },
    {},
  ).optimizeDeps!.include;
  expect(include).toEqual(expect.arrayContaining(['alias_config']));
});

test('empty alias config', () => {
  const optimizeDeps = IConfigProcessor({ entry: {} }, {}).optimizeDeps;
  expect(optimizeDeps).toEqual(
    expect.objectContaining({
      entries: [],
    }),
  );
});

test('empty alias config', () => {
  const include = IConfigProcessor(
    { alias: { dva$: 'node_modules' }, entry: {} },
    {},
  ).optimizeDeps!.include;
  expect(include).toEqual(expect.arrayContaining(['dva']));
});
