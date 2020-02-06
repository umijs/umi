import pkgUp from 'pkg-up';
import { basename, dirname, extname, join } from 'path';
import { existsSync } from 'fs';
import camelcase from 'camelcase';
import assert from 'assert';
import {
  compatESModuleRequire,
  createDebug,
  resolve,
  winPath,
} from '@umijs/utils';
import { PluginType } from '../enums';
import { IPackage, IPlugin } from '../types';

const debug = createDebug('umi:core:Service:util:plugin');

interface IOpts {
  pkg: IPackage;
  cwd: string;
}

interface IResolvePresetsOpts extends IOpts {
  presets: string[];
  userConfigPresets: string[];
}

interface IResolvePluginsOpts extends IOpts {
  plugins: string[];
  userConfigPlugins: string[];
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
    // opts
    ...((opts[type === PluginType.preset ? 'presets' : 'plugins'] as any) ||
      []),
    // env
    ...(process.env[`UMI_${upperCaseType}S`] || '').split(',').filter(Boolean),
    // dependencies
    ...Object.keys(opts.pkg.devDependencies || {})
      .concat(Object.keys(opts.pkg.dependencies || {}))
      .filter(isPluginOrPreset.bind(null, type)),
    // user config
    ...((opts[
      type === PluginType.preset ? 'userConfigPresets' : 'userConfigPlugins'
    ] as any) || []),
  ].map(path => {
    return resolve.sync(path, {
      basedir: opts.cwd,
      extensions: ['.js'],
    });
  });
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

  assert(existsSync(path), `${type} ${path} not exists, pathToObj failed`);

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
  const id = isPkgPlugin ? pkg!.name : winPath(path);
  const key = isPkgPlugin
    ? pkgNameToKey(pkg!.name, type)
    : nameToKey(basename(path, extname(path)));

  return {
    id,
    key,
    path: winPath(path),
    apply() {
      // use function to delay require
      try {
        const ret = require(path);
        // use the default member for es modules
        return compatESModuleRequire(ret);
      } catch (e) {
        throw new Error(`Register ${type} ${path} failed, since ${e.message}`);
      }
    },
    defaultConfig: null,
  };
}

export function resolvePresets(opts: IResolvePresetsOpts) {
  const type = PluginType.preset;
  const presets = [...getPluginsOrPresets(type, opts)];
  debug(`preset paths:`);
  debug(presets);
  return presets.map(pathToObj.bind(null, type));
}

export function resolvePlugins(opts: IResolvePluginsOpts) {
  const type = PluginType.plugin;
  const plugins = getPluginsOrPresets(type, opts);
  debug(`plugin paths:`);
  debug(plugins);
  return plugins.map(pathToObj.bind(null, type));
}

export function isValidPlugin(plugin: IPlugin) {
  return plugin.id && plugin.key && plugin.apply;
}
