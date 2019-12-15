import mergeConfig from './mergeConfig';

test('extend property', () => {
  expect(mergeConfig({ a: 1 }, { b: 2 })).toEqual({
    a: 1,
    b: 2,
  });
});

test('merge property', () => {
  expect(mergeConfig({ a: 1 }, { a: 2 })).toEqual({
    a: 2,
  });
});

test('modify with function', () => {
  expect(
    mergeConfig(
      { a: 1 },
      {
        a(memo: number) {
          return memo + 1;
        },
      },
    ),
  ).toEqual({
    a: 2,
  });
});
