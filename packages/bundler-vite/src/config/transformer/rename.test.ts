import rename from './rename';

test('top-level fields rename ', () => {
  expect(rename({ publicPath: '/rename/publicPath' }, {})).toEqual({
    base: '/rename/publicPath',
  });
});

test('nested fields rename', () => {
  expect(
    rename(
      {
        jsMinifier: '/rename/jsMinifier',
        jsMinifierOptions: '/rename/jsMinifierOptions',
      },
      {},
    ).build,
  ).toEqual(
    expect.objectContaining({
      minify: '/rename/jsMinifier',
      terserOptions: '/rename/jsMinifierOptions',
    }),
  );
});
