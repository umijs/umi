import { existsSync } from 'fs';
import { join } from 'path';
import winPath from '../winPath/winPath';

/**
 * @description
 * - `'javascript'`: try to match the file with extname `.{ts(x)|js(x)}`
 * - `'css'`: try to match the file with extname `.{less|sass|scss|stylus|css}`
 */
type FileType = 'javascript' | 'css';

interface IGetFileOpts {
  base: string;
  type: FileType;
  fileNameWithoutExt: string;
}

const extsMap: Record<FileType, string[]> = {
  javascript: ['.ts', '.tsx', '.js', '.jsx'],
  css: ['.less', '.sass', '.scss', '.stylus', '.css'],
};

/**
 * Try to match the exact extname of the file in a specific directory.
 * @returns
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
export default function getFile(opts: IGetFileOpts) {
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
