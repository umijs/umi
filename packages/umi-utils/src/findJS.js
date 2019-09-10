import { join } from 'path';
import { existsSync } from 'fs';

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(baseDir, fileNameWithoutExtname) {
  let i = 0;
  while (i < JS_EXTNAMES.length) {
    const extname = JS_EXTNAMES[i];
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
    i += 1;
  }
  return null;
}
