import { join } from 'path';
import Service from './Service';

const fixtures = join(__dirname, 'fixtures');

test('normal', () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    useBuiltIn: false,
    presets: [
      require.resolve(join(cwd, 'preset_1')),
      require.resolve(join(cwd, 'preset_2')),
    ],
    plugins: [
      require.resolve(join(cwd, 'plugin_1')),
      require.resolve(join(cwd, 'plugin_2')),
    ],
  });
  expect(service.pkg).toEqual({ name: 'foo' });
  expect(service.initialPresets.map(p => p.key)).toEqual(['index', 'index']);
  expect(service.initialPlugins.map(p => p.key)).toEqual([
    'plugin1',
    'plugin2',
  ]);

  service.init();
  const plugins = Object.keys(service.plugins).map(id => {
    const type = service.plugins[id].isPreset ? 'preset' : 'plugin';
    return `[${type}] ${id.replace(cwd, '.')}`;
  });
  expect(plugins).toEqual([
    '[preset] ./preset_1/index.js',
    '[preset] ./preset_1/preset_1/index.js',
    '[preset] ./preset_2/index.js',
    '[plugin] ./preset_1/plugin_1.js',
    '[plugin] ./preset_1/plugin_2.js',
    '[plugin] ./preset_1/preset_1/plugin_1.js',
    '[plugin] ./preset_2/plugin_1.js',
    '[plugin] ./plugin_1.js',
    '[plugin] ./plugin_2.js',
  ]);
});

test('use built-in', () => {
  const service = new Service({
    cwd: join(fixtures, 'normal'),
    useBuiltIn: true,
  });
  expect(service.initialPresets[0].id).toEqual('@umijs/preset-built-in');
});

test('no package.json', () => {
  const service = new Service({
    cwd: join(fixtures, 'no-package-json'),
  });
  expect(service.pkg).toEqual({});
});
