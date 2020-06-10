import { pkgUp, semver } from '@umijs/utils';
import { dirname } from 'path';

const pkgPathCache = {};
const pkgCache = {};

// type 为 all 时以下依赖不走 babel 编译
export const TYPE_ALL_EXCLUDE = [
  '@ant-design/icons',
  '@ant-design/icons-svg',
  '@babel/runtime',
  'bizcharts',
  'core-js',
  'echarts',
  'lodash',
  'react',
  'react-dom',
];

interface IPkgs {
  [name: string]: string[];
}

// 参考：
// https://github.com/umijs/umi/blob/2.x/packages/af-webpack/src/getWebpackConfig/es5ImcompatibleVersions.js
export function isMatch(opts: { path: string; pkgs: IPkgs }) {
  const pkgPath = getPkgPath(opts);

  // 可能没有 package.json
  if (!pkgPath) return false;

  if (pkgPath in pkgCache) return pkgCache[pkgPath];

  const { name, version } = require(pkgPath); // eslint-disable-line
  if (opts.pkgs[name]) {
    pkgCache[pkgPath] = opts.pkgs[name].some((v) => {
      return semver.satisfies(version, v);
    });
  } else {
    pkgCache[pkgPath] = false;
  }

  return pkgCache[pkgPath];
}

function getPkgPath(opts: { path: string }) {
  const dir = dirname(opts.path);
  if (dir in pkgPathCache) return pkgPathCache[dir];
  pkgPathCache[dir] = pkgUp.sync({ cwd: opts.path });
  return pkgPathCache[dir];
}

export function excludeToPkgs(opts: { exclude: string[] }): IPkgs {
  return opts.exclude.reduce((memo, exclude) => {
    const { name, versions } = excludeToPkg({ exclude });
    memo[name] = versions;
    return memo;
  }, {});
}

function excludeToPkg(opts: { exclude: string }) {
  let firstAt = '';
  let left = opts.exclude;
  if (left.charAt(0) === '@') {
    firstAt = '@';
    left = left.slice(1);
  }

  let [name, version] = left.split('@');
  name = `${firstAt}${name}`;
  if (!version) {
    version = '*';
  }

  return { name, versions: [version] };
}

export function es5ImcompatibleVersionsToPkg() {
  const {
    config: { 'es5-imcompatible-versions': config },
  } = require('es5-imcompatible-versions/package.json');
  return Object.keys(config).reduce((memo, key) => {
    memo[key] = Object.keys(config[key]);
    return memo;
  }, {});
}
