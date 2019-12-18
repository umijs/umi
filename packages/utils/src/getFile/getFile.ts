import { join } from 'path';
import { existsSync } from 'fs';
import winPath from '../winPath/winPath';

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
    const path = winPath(join(opts.base, filename));
    if (existsSync(path)) {
      return {
        path,
        filename,
      };
    }
  }
  return null;
}
