import { pkgUp } from '@umijs/utils';
import path from 'path';

/**
 * find the closet package.json which contains `name`
 * why not use pkg-up directly? some package (such as htmlparser2@8) put a `package.json` with
 * `{ "type": "module" }` to provide pure esm dist, but it is not the npm `package.json` we want
 */
export const pkgUpContainName = (dir: string): string | null => {
  let pkgPath = pkgUp.sync({ cwd: dir });
  if (!pkgPath) return pkgPath;
  const { name } = require(pkgPath);
  // invalid package
  if (!name) {
    dir = path.dirname(pkgPath);
    return pkgUpContainName(path.dirname(dir));
  }
  return pkgPath;
};
