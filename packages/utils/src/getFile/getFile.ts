import { join } from 'path';
import { existsSync } from 'fs';

interface IOpts {
  base: string;
  type: 'javascript' | 'css';
  fileNameWithoutExt: string;
}

const extsMap = {
  javascript: ['.ts', '.tsx', '.js', '.jsx'],
  css: ['.less', '.sass', '.scss', '.stylus', '.css'],
};

export default function(opts: IOpts) {
  const exts = extsMap[opts.type];
  for (const ext of exts) {
    const filename = `${opts.fileNameWithoutExt}${ext}`;
    const path = join(opts.base, filename);
    if (existsSync(path)) {
      return {
        path,
        filename,
      };
    }
  }
  return null;
}
