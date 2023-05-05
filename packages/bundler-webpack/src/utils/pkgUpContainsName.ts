import { pkgUp } from '@umijs/utils';
import path from 'path';
export function pkgUpContainsName(file: string): string | null {
  let pkgPath = pkgUp.pkgUpSync({ cwd: file });
  if (!pkgPath) return null;
  const { name } = require(pkgPath);
  // invalid package
  if (!name) {
    return pkgUpContainsName(path.resolve(pkgPath, '../..'));
  }
  return pkgPath;
}
