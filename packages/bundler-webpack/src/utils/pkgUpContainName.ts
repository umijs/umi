import { pkgUp } from '@umijs/utils';
import path from 'path';

export const pkgUpContainName = (dir: string): string | undefined => {
  let pkgPath = pkgUp.pkgUpSync({ cwd: dir });
  if (!pkgPath) return pkgPath;
  const { name } = require(pkgPath);
  // invalid package
  if (!name&&!["."].includes(dir)) return pkgUpContainName(path.dirname(dir));
  return pkgPath;
};
