import { join } from 'path';
import { existsSync } from 'fs';

const CSS_EXTNAMES = ['.css', '.less', '.scss', '.sass'];

export default function(baseDir, fileNameWithoutExtname) {
  for (const extname of CSS_EXTNAMES) {
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }
  return null;
}
