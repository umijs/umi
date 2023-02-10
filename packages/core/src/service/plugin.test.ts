import { Plugin } from './plugin';

test('isPluginOrPreset', () => {
  // true
  expect(Plugin.isPluginOrPreset('preset', '@umijs/preset-foo')).toBe(true);
  expect(Plugin.isPluginOrPreset('plugin', 'umi-plugin-foo')).toBe(true);
  expect(Plugin.isPluginOrPreset('plugin', '@alipay/umi-plugin-foo')).toEqual(
    true,
  );
  // false
  expect(Plugin.isPluginOrPreset('plugin', 'foo')).toBe(false);
  expect(Plugin.isPluginOrPreset('plugin', '@umijs/preset-foo')).toBe(false);
});
