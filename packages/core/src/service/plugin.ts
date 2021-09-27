import { lodash, pkgUp, resolve, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { basename, dirname, extname, join, relative } from 'path';
import { EnableBy, IPluginConfig } from '../types';

const RE = {
  plugin: /^(@umijs\/|umi-)plugin-/,
  preset: /^(@umijs\/|umi-)preset-/,
};

type PluginType = 'plugin' | 'preset';

interface IOpts {
  path: string;
  cwd: string;
  type: PluginType;
}

export class Plugin {
  private cwd: string;
  type: PluginType;
  path: string;
  id: string;
  key: string;
  apply: Function;
  config: IPluginConfig = {};
  enableBy: EnableBy | (() => boolean) = EnableBy.register;

  constructor(opts: IOpts) {
    this.type = opts.type;
    this.path = winPath(opts.path);
    this.cwd = opts.cwd;

    assert(
      existsSync(this.path),
      `Invalid ${this.type} ${this.path}, it's not exists.`,
    );

    let pkg = null;
    // path is the package entry
    let isPkgEntry = false;
    const pkgJSONPath = pkgUp.sync({ cwd: this.path });
    if (pkgJSONPath) {
      pkg = require(pkgJSONPath);
      isPkgEntry =
        winPath(join(dirname(pkgJSONPath), pkg.main || 'index.js')) ===
        winPath(this.path);
    }
    this.id = this.getId({ pkg, isPkgEntry, pkgJSONPath });
    this.key = this.getKey({ pkg, isPkgEntry });
    this.apply = () => {
      try {
        const ret = require(this.path);
        // use the default member for es modules
        return ret.__esModule ? ret.default : ret;
      } catch (e: any) {
        throw new Error(
          `Register ${this.type} ${this.path} failed, since ${e.message}`,
        );
      }
    };
  }

  merge(opts: {
    key: string;
    config: IPluginConfig;
    enableBy: EnableBy | (() => boolean);
  }) {
    if (opts.key) this.key = opts.key;
    if (opts.config) this.config = opts.config;
    if (opts.enableBy) this.enableBy = opts.enableBy;
  }

  getId(opts: { pkg: any; isPkgEntry: boolean; pkgJSONPath: string | null }) {
    let id;
    if (opts.isPkgEntry) {
      id = opts.pkg!.name;
    } else if (winPath(this.path).startsWith(winPath(this.cwd))) {
      id = `./${winPath(relative(this.cwd, this.path))}`;
    } else if (opts.pkgJSONPath) {
      id = winPath(
        join(opts.pkg!.name, relative(dirname(opts.pkgJSONPath), this.path)),
      );
    } else {
      id = winPath(this.path);
    }
    id = id.replace('@umijs/preset-built-in/lib/plugins', '@@');
    id = id.replace(/\.js$/, '');
    return id;
  }

  getKey(opts: { pkg: any; isPkgEntry: boolean }) {
    // e.g.
    // initial-state -> initialState
    // webpack.css-loader -> webpack.cssLoader
    function nameToKey(name: string) {
      return name
        .split('.')
        .map((part) => lodash.camelCase(part))
        .join('.');
    }
    return nameToKey(
      opts.isPkgEntry
        ? Plugin.stripNoneUmiScope(opts.pkg.name).replace(RE[this.type], '')
        : basename(this.path, extname(this.path)),
    );
  }

  static isPluginOrPreset(type: 'plugin' | 'preset', name: string) {
    return RE[type].test(Plugin.stripNoneUmiScope(name));
  }

  static stripNoneUmiScope(name: string) {
    if (name.charAt(0) === '@' && !name.startsWith('@umijs/')) {
      name = name.split('/')[1];
    }
    return name;
  }

  static getPluginsAndPresets(opts: {
    cwd: string;
    pkg: any;
    userConfig: any;
    plugins?: string[];
    presets?: string[];
  }) {
    function get(type: 'plugin' | 'preset') {
      const types = `${type}s` as 'plugins' | 'presets';
      return [
        // opts
        ...(opts[types] || []),
        // env
        // ...(process.env[`UMI_${types.toUpperCase()}`] || '')
        //   .split(',')
        //   .filter(Boolean),
        // dependencies
        ...Object.keys(opts.pkg.devDependencies || {})
          .concat(Object.keys(opts.pkg.dependencies || {}))
          .filter(Plugin.isPluginOrPreset.bind(null, type)),
        // user config
        ...(opts.userConfig[types] || []),
      ].map((path) => {
        assert(
          typeof path === 'string',
          `Invalid plugin ${path}, it must be string.`,
        );
        let resolved;
        try {
          resolved = resolve.sync(path, {
            basedir: opts.cwd,
            extensions: ['.tsx', '.ts', '.mjs', '.jsx', '.js'],
          });
        } catch (_e) {
          throw new Error(`Invalid plugin ${path}, can not be resolved.`);
        }

        return new Plugin({
          path: resolved,
          type,
          cwd: opts.cwd,
        });
      });
    }
    return {
      presets: get('preset'),
      plugins: get('plugin'),
    };
  }
}
