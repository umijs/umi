import { rimraf } from '@umijs/utils';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { CACHE_DIR_NAME } from '../constants';

export function clearTmp(absTmpPath: string) {
  if (!existsSync(absTmpPath)) return;
  readdirSync(absTmpPath).forEach((file) => {
    if (file === CACHE_DIR_NAME) return;
    rimraf.sync(join(absTmpPath, file));
  });
}
