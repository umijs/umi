import { dirname } from 'path';
import pkgUp from 'pkg-up';
import { satisfies } from 'semver';

const pkgPathCache = {};
const pkgCache = {};
const {
  config: { 'es5-imcompatible-versions': config },
} = require('es5-imcompatible-versions/package');

function getPkgPath(filePath) {
  const dir = dirname(filePath);
  if (dir in pkgPathCache) return pkgPathCache[dir];
  pkgPathCache[dir] = pkgUp.sync(filePath);
  return pkgPathCache[dir];
}

function shouldTransform(pkgPath) {
  if (pkgPath in pkgCache) return pkgCache[pkgPath];
  const { name, version } = require(pkgPath); // eslint-disable-line
  pkgCache[pkgPath] = isMatch(name, version);
  return pkgCache[pkgPath];
}

function isMatch(name, version) {
  if (config[name]) {
    return Object.keys(config[name]).some(sv => satisfies(version, sv));
  } else {
    return false;
  }
}

export default api => {
  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.extraBabelIncludes = [
      ...(memo.extraBabelIncludes || []),
      a => {
        if (a.indexOf('node_modules') === -1) return false;
        const pkgPath = getPkgPath(a);
        return shouldTransform(pkgPath);
      },
    ];
    return memo;
  });
};
