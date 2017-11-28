import expect from 'expect';
import { join } from 'path';
import { resolvePlugins, applyPlugins } from '../src/index';

describe('plugin', () => {
  it('normal', () => {
    const plugins = resolvePlugins([
      require.resolve('./fixtures/p1'),
      require.resolve('./fixtures/p2'),
    ]);
    expect(applyPlugins(plugins, 'foo', 1)).toEqual(10);
    expect(applyPlugins(plugins, 'bar', 1)).toEqual(1);
    expect(applyPlugins(plugins, 'foo', 1, /* plugin arg */ 2)).toEqual(15);
  });

  it('plugin file not exists', () => {
    expect(() => {
      resolvePlugins([join(__dirname, 'not-exists')]);
    }).toThrow(/plugin file not exists/);
  });
});
