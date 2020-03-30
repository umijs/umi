import { pkgUp } from '@umijs/utils';
import { dirname } from 'path';

const pkgPathCache = {};
const pkgCache = {};

// 以下依赖不走 babel 编译
const EXCLUDE_PKGS = [
  '@ant-design/icons',
  '@babel/runtime',
  'bizcharts',
  'core-js',
  'echarts',
  'lodash',
  'react',
  'react-dom',
];

// 参考：
// https://github.com/umijs/umi/blob/2.x/packages/af-webpack/src/getWebpackConfig/es5ImcompatibleVersions.js
export default function (opts: { path: string }) {
  const pkgPath = getPkgPath(opts);
  console.log('>> ', opts.path, pkgPath);
  if (pkgPath in pkgCache) return pkgCache[pkgPath];
  const { name } = require(pkgPath); // eslint-disable-line
  pkgCache[pkgPath] = isMatch({ name });
  return pkgCache[pkgPath];
}

function getPkgPath(opts: { path: string }) {
  const dir = dirname(opts.path);
  if (dir in pkgPathCache) return pkgPathCache[dir];
  pkgPathCache[dir] = pkgUp.sync({ cwd: opts.path });
  return pkgPathCache[dir];
}

function isMatch(opts: { name: string }) {
  return EXCLUDE_PKGS.includes(opts.name);
}
