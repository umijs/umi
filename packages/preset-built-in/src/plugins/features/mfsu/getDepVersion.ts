import { pkgUp, winPath } from '@umijs/utils';
import assert from 'assert';
import { extname, isAbsolute, join } from 'path';

interface IAlias {
  [key: string]: string;
}

function isJSFile(path: string) {
  return ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path));
}

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export function getAliasedDep(opts: { dep: string; webpackAlias?: IAlias }) {
  let dep = opts.dep;
  const webpackAlias = opts.webpackAlias || {};

  // get aliased dep
  for (const key of Object.keys(webpackAlias)) {
    const value = webpackAlias[key];
    if (isJSFile(value)) {
      if (dep === key) {
        dep = value;
        break;
      }
    } else {
      if (dep === key) {
        dep = value;
        break;
      }

      const slashedKey = addLastSlash(key);
      if (dep.startsWith(slashedKey)) {
        dep = dep.replace(new RegExp(`^${slashedKey}`), addLastSlash(value));
        break;
      }
    }
  }

  return dep;
}

export function getDepVersion(opts: {
  dep: string;
  cwd: string;
  webpackAlias?: IAlias;
}) {
  const originDep = opts.dep;
  let version = '*';
  const dep = getAliasedDep(opts);

  // absolute
  if (isAbsolute(dep)) {
    const pkg = pkgUp.sync({ cwd: dep });
    assert(pkg, `[MFSU] package.json not found for dep ${originDep}`);
    version = require(pkg).version;
  } else {
    const pkg = pkgUp.sync({
      cwd: join(opts.cwd, 'node_modules', dep),
    });
    assert(pkg, `[MFSU] package.json not found for dep ${originDep}`);
    assert(
      winPath(pkg) !== winPath(join(opts.cwd, 'package.json')),
      `[MFSU] package.json not found for dep ${originDep}`,
    );
    version = require(pkg).version;
  }

  return version;
}
