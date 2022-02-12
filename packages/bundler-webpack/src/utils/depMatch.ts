import { pkgUp, semver, winPath } from '@umijs/utils';
import { dirname } from 'path';

const cache = new Map<string, boolean>();

export function cleanCache() {
  cache.clear();
}

export function isMatch(opts: {
  path: string;
  pkgs: Record</*name*/ string, /*version*/ string[]>;
}): boolean {
  // cache by dir, 命中率会更高
  const dir = winPath(dirname(opts.path));
  if (cache.has(dir)) {
    return !!cache.get(dir);
  } else {
    const pkgPath = pkgUp.pkgUpSync({ cwd: opts.path });

    let ret;
    if (!pkgPath) {
      ret = false;
    } else {
      const { name, version } = require(pkgPath);
      if (opts.pkgs[name]) {
        ret = opts.pkgs[name].some((v) => {
          return semver.satisfies(version, v);
        });
      } else {
        ret = false;
      }
    }
    cache.set(dir, ret);
    return ret;
  }
}

export function es5ImcompatibleVersionsToPkg() {
  const {
    config: { 'es5-imcompatible-versions': config },
  } = require('es5-imcompatible-versions/package.json');
  return Object.keys(config).reduce<Record<string, string[]>>((memo, key) => {
    memo[key] = /* versions */ Object.keys(config[key]);
    return memo;
  }, {} as any);
}
