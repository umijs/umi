import { pkgUp } from '@umijs/utils';
import path from 'path';

export const pkgUpContainName = (dir: string): string | null => {
  let pkgPath = pkgUp.pkgUpSync({ cwd: dir });
  if (!pkgPath) return pkgPath;
  const { name } = require(pkgPath);
  // invalid package
  if (!name) return pkgUpContainName(path.dirname(dir));
  return pkgPath;
};