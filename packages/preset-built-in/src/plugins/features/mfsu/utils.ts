import { winPath } from '@umijs/utils';
import assert from 'assert';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { isAbsolute, join } from 'path';
import { getDepReExportContent } from './getDepReExportContent';
import { getFilePath } from './getFilePath';

export const copy = (fromDir: string, toDir: string) => {
  try {
    const fn = (dir: string, preserveDir: string) => {
      const _dir = readdirSync(dir);
      _dir.forEach((value) => {
        const _path = join(dir, value);
        const stat = statSync(_path);
        if (stat.isDirectory()) {
          const _toDir = join(toDir, preserveDir, value);
          if (!existsSync(_toDir)) {
            mkdirSync(_toDir);
          }
          fn(_path, join(preserveDir, value));
        } else {
          const toDest = join(toDir, preserveDir);
          copyFileSync(_path, join(toDest, value));
        }
      });
    };
    fn(fromDir, '');
  } catch (error) {
    throw error;
  }
};

export const figureOutExport = async (
  cwd: string,
  importFrom: string,
): Promise<string> => {
  let filePath;
  if (isAbsolute(importFrom)) {
    filePath = getFilePath(importFrom);
  } else {
    let count = 0;
    while (!filePath && cwd !== '/' && count <= 10) {
      try {
        const absImportFrom = join(cwd, 'node_modules', importFrom);
        filePath = getFilePath(absImportFrom);
      } catch (e) {}
      cwd = join(cwd, '..');
    }
  }

  assert(filePath, `filePath not found of ${importFrom}`);

  const content = readFileSync(filePath, 'utf-8');
  return getDepReExportContent({
    content,
    filePath,
    importFrom: winPath(importFrom),
  });
};

export const matchAll = (regexp: RegExp, str: string) => {
  const result = [];
  let match;
  while ((match = regexp.exec(str)) !== null) {
    result.push(match);
  }
  return result;
};
