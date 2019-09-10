import { join } from 'path';
import { existsSync } from 'fs';

const CSS_EXTNAMES = ['.css', '.less', '.scss', '.sass'];

export default function(baseDir, fileNameWithoutExtname) {
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
