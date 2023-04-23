import { existsSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '../../../');
const rootPkg = join(root, './package.json');

/**
 * Check whether it is development in local
 */
export const isLocalDev = () => {
  const isLocal = existsSync(rootPkg) && require(rootPkg)._local;
  return isLocal ? root : false;
};
