import { basename, join } from 'path';
import { existsSync, readdirSync, statSync } from '../compiled/fs-extra';

interface FileItem {
  filePath: string;
  name: string;
}

export const readDirFiles = (opts: { dir: string; exclude?: RegExp[] }) => {
  const { dir, exclude = [] } = opts;
  const list: FileItem[] = [];

  const recursiveReadFiles = (p: string) => {
    if (!existsSync(p)) {
      return;
    }
    const isFile = statSync(p).isFile();
    if (isFile) {
      const name = basename(p);
      list.push({
        filePath: p,
        name,
      });
      return;
    }
    // is dir
    const files = readdirSync(p)
      .filter((name) => {
        return name !== '.DS_Store';
      })
      .map((file) => {
        const absolutePath = join(p, file);
        return absolutePath;
      })
      .filter((file) => {
        const isExclude = exclude.some((reg) => reg.test(file));
        return !isExclude;
      });
    files.forEach((file) => {
      recursiveReadFiles(file);
    });
  };
  recursiveReadFiles(dir);

  return list;
};
