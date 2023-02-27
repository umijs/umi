import { readdir, readdirSync, statSync } from 'fs';
import { join } from 'path';

const isExclude = (exclude: RegExp[], path: string) => {
  return exclude.some((reg) => reg.test(path));
};

export const getAllFilesSync = (
  currentDirPath: string,
  exclude: RegExp[],
  callback: (path: string) => void,
) => {
  readdirSync(currentDirPath).forEach(function (name: string) {
    const filePath = join(currentDirPath, name);
    if (isExclude(exclude, filePath)) {
      return;
    }

    const stat = statSync(filePath);

    if (stat.isFile()) {
      callback(filePath);
    } else if (stat.isDirectory()) {
      getAllFilesSync(filePath, exclude, callback);
    }
  });
};

export const getAllFilesAsync = (
  currentDirPath: string,
  exclude: RegExp[],
  callback: (path: string) => void,
) => {
  readdir(
    currentDirPath,
    function (err: NodeJS.ErrnoException | null, files: string[]) {
      if (err) {
        throw new Error(err.message);
      }
      files.forEach(function (name) {
        const filePath = join(currentDirPath, name);
        if (isExclude(exclude, filePath)) {
          return;
        }

        const stat = statSync(filePath);
        if (stat.isFile()) {
          callback(filePath);
        } else if (stat.isDirectory()) {
          getAllFilesAsync(filePath, exclude, callback);
        }
      });
    },
  );
};
