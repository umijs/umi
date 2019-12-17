import pkgUp from 'pkg-up';
import { dirname, join, basename, extname } from 'path';
import camelcase from 'camelcase';
import { winPath } from '@umijs/utils';
import { PluginType } from '../enums';

interface IOpts {
  pkg: IPackage;
  cwd: string;
  useBuiltIn: boolean;
}

interface IResolvePresetsOpts extends IOpts {
  presets: IPreset[];
}

interface IResolvePluginsOpts extends IOpts {
  plugins: IPlugin[];
}

const RE = {
  [PluginType.plugin]: /^(@umijs\/|umi-)plugin-/,
  [PluginType.preset]: /^(@umijs\/|umi-)preset-/,
};

function isPluginOrPreset(type: PluginType, name: string) {
  const hasScope = name.charAt(0) === '@';
  const re = RE[type];
  if (hasScope) {
    return re.test(name.split('/')[1]) || re.test(name);
  } else {
    return re.test(name);
  }
}

function getPluginsOrPresets(type: PluginType, opts: IOpts): string[] {
  const upperCaseType = type.toUpperCase();
  return [
    // env
    ...(process.env[`UMI_${upperCaseType}`] || '').split(',').filter(Boolean),
    // dependencies
    ...Object.keys(opts.pkg.devDependencies || {})
      .concat(Object.keys(opts.pkg.dependencies || {}))
      .filter(isPluginOrPreset.bind(null, type)),
    // user config
    ...((opts[type] as any) || []),
  ];
}

// e.g.
// initial-state -> initialState
// webpack.css-loader -> webpack.cssLoader
function nameToKey(name: string) {
  return name
    .split('.')
    .map(part => camelcase(part))
    .join('.');
}

function pkgNameToKey(pkgName: string, type: PluginType) {
  // strip none @umijs scope
  if (pkgName.charAt(0) === '@' && !pkgName.startsWith('@umijs/')) {
    pkgName = pkgName.split('/')[1];
  }
  return nameToKey(pkgName.replace(RE[type], ''));
}

export function pathToObj(type: PluginType, path: string) {
  let pkg = null;
  let isPkgPlugin = false;

  const pkgJSONPath = pkgUp.sync({ cwd: path });
  if (pkgJSONPath) {
    pkg = require(pkgJSONPath);
    isPkgPlugin =
      winPath(join(dirname(pkgJSONPath), pkg.main || 'index.js')) ===
      winPath(path);
  }

  // TODO: 自动 resolve 的 id 不要太长，通过一定的规则缩短
  // 1. 如果是当前项目的临时插件，可以用相对路径，比如：./plugin.ts
  // 2. 如果是依赖的子路径，可以从依赖开始用子路径，比如：@alipay/umi-plugin-bigfish/lib/plugins/deer.js
  const id = isPkgPlugin ? pkg!.name : path;
  const key = isPkgPlugin
    ? nameToKey(pkg!.name.replace(RE[type], ''))
    : nameToKey(basename(path, extname(path)));

  return {
    id,
    key,
    path: winPath(path),
    apply: require(path),
    defaultConfig: null,
  };
}

export function resolvePresets(opts: IResolvePresetsOpts) {
  const type = PluginType.preset;
  const presets = [
    ...(opts.useBuiltIn ? require.resolve('@umijs/preset-built-in') : []),
    ...getPluginsOrPresets(type, opts),
  ];
  return presets.map(pathToObj.bind(null, type));
}

export function resolvePlugins(opts: IResolvePluginsOpts) {
  const type = PluginType.plugin;
  const plugins = getPluginsOrPresets(type, opts);
  return plugins.map(pathToObj.bind(null, type));
}

export function isValidPlugin(plugin: IPlugin) {
  return plugin.id && plugin.key && plugin.apply;
}
