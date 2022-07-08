import { dirname } from 'path';
import { pkgUpContainName } from './pkgUpContainName';

const pkgPathCache = {};

export function getPkgPath(filePath: string) {
  const dir = dirname(filePath);
  if (dir in pkgPathCache) return pkgPathCache[dir];
  pkgPathCache[dir] = pkgUpContainName(dir);
  return pkgPathCache[dir];
}

export function shouldTransform(pkgPath: string, include: string) {
  const { name } = require(pkgPath); // eslint-disable-line
  return name === include;
}
