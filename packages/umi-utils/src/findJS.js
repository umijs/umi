import { join } from 'path';
import { existsSync } from 'fs';

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(baseDir, fileNameWithoutExtname) {
  for (const extname of JS_EXTNAMES) {
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }
  return null;
}
