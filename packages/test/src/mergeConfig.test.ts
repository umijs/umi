import mergeConfig from './mergeConfig';

test('mergeConfig', () => {
  mergeConfig({ a: 1 }, { b: 2 }).toEqual({
    a: 1,
    b: 2,
  });
});
