import { join } from 'path';
import { existsSync } from 'fs';

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Find the real JS file. Automatic completion of suffixes
 * @param baseDir base path
 * @param fileNameWithoutExtname file name
 */
export default function(baseDir: string, fileNameWithoutExtname?: string): string {
  let i = 0;
  while (i < JS_EXTNAMES.length) {
    const extname = JS_EXTNAMES[i];
    const absFilePath = fileNameWithoutExtname
      ? join(baseDir, `${fileNameWithoutExtname}${extname}`)
      : `${baseDir}${extname}`;
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
    i += 1;
  }
  return null;
}
