import { join } from 'path';
import { existsSync } from 'fs';

const CSS_EXTNAMES = ['.css', '.less', '.scss', '.sass'];

/**
 * Find the real CSS file. Automatic completion of suffixes
 * @param {*} baseDir
 * @param {*} fileNameWithoutExtname
 */
export default function(baseDir: string, fileNameWithoutExtname: string): string {
  let i = 0;
  while (i < CSS_EXTNAMES.length) {
    const extname = CSS_EXTNAMES[i];
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
    i += 1;
  }
  return null;
}
