import { join } from 'path';
import { readdirSync, statSync } from '../compiled/fs-extra';

interface FileItem {
  filePath: string;
  name: string;
}

const isExclude = (exclude: RegExp[], path: string) => {
  return exclude.some((reg) => reg.test(path));
};

export const readDirFilesSync = (
  currentDirPath: string,
  dirExclude: RegExp[],
) => {
  const dirList = [currentDirPath];
  const fileList: FileItem[] = [];

  for (let i = 0; i < dirList.length; i++) {
    const path = dirList[i];

    readdirSync(path).forEach((name) => {
      const filePath = join(path, name);
      const stat = statSync(filePath);
      if (stat.isFile()) {
        fileList.push({
          name,
          filePath,
        });
      } else if (stat.isDirectory()) {
        // 不在 exclude 内的文件夹继续遍历
        if (!isExclude(dirExclude, name)) {
          dirList.push(filePath);
        }
      }
    });
  }

  return fileList;
};
