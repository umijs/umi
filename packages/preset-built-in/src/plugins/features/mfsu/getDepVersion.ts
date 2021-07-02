import { pkgUp, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { dirname, extname, isAbsolute, join } from 'path';

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
    let tmpDep = dep;
    let tmpVersion;
    let count = 0;
    // Fix invalid package.json
    // ref: https://unpkg.alibaba-inc.com/browse/@babel/runtime@7.14.6/helpers/esm/package.json
    while (!tmpVersion && count <= 10) {
      const pkg = pkgUp.sync({ cwd: tmpDep });
      assert(pkg, `[MFSU] package.json not found for dep ${originDep}`);
      tmpVersion = require(pkg).version;
      tmpDep = dirname(dirname(pkg));
      count += 1;
    }
    assert(
      count !== 10,
      `[MFSU] infinite loop when finding version for dep ${originDep}`,
    );
    version = tmpVersion;
  } else {
    let pkg;
    let cwd = opts.cwd;
    let count = 0;
    const depSplited = dep.split('/');
    const name =
      dep.charAt(0) === '@' ? depSplited.slice(0, 2).join('/') : depSplited[0];
    while (!pkg && cwd !== '/' && count < 10) {
      const pkgPath = join(cwd, 'node_modules', name);
      if (existsSync(pkgPath)) {
        pkg = pkgPath;
        break;
      }
      cwd = join(cwd, '..');
      count += 1;
    }
    assert(pkg, `[MFSU] package.json not found for dep ${originDep}`);
    // TODO: 这个可能走不到了
    assert(
      winPath(pkg) !== winPath(join(opts.cwd, 'package.json')),
      `[MFSU] package.json not found for dep ${originDep}`,
    );
    version = require(pkg).version;
  }

  return version;
}
