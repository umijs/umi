import { existsSync } from 'fs';
import { dirname, extname, isAbsolute, join } from 'path';

const FILE_EXT_NAMES = ['.tsx', '.ts', '.jsx', '.mjs', '.js'];

export function getRealPath(opts: { file: string; dep: string }) {
  const target = isAbsolute(opts.dep)
    ? opts.dep
    : join(dirname(opts.file), opts.dep);
  if (FILE_EXT_NAMES.includes(extname(target))) {
    return target;
  } else {
    for (const fileExtName of FILE_EXT_NAMES) {
      const targetWithExtName = `${target}${fileExtName}`;
      if (existsSync(targetWithExtName)) {
        return targetWithExtName;
      }
    }
    return null;
  }
}
