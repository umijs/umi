import { getPluginConfig } from './ui';

test('getPluginConfig', () => {
  expect(getPluginConfig(['a'], 'a')).toEqual({});
  expect(getPluginConfig([['a']], 'a')).toEqual({});
  expect(getPluginConfig([['a', { a: 'b' }]], 'a')).toEqual({
    a: 'b',
  });
});

test('getPluginConfig not found', () => {
  expect(getPluginConfig([], 'a')).toEqual(null);
  expect(getPluginConfig(['b', ['c']], 'a')).toEqual(null);
});
