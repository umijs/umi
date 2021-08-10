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
import { getFilePath, getProperCwd } from './getFilePath';

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
  ignoreNodeBuiltInModules?: boolean,
): Promise<string> => {
  const absImportFrom = isAbsolute(importFrom)
    ? importFrom
    : join(getProperCwd(cwd), 'node_modules', importFrom);
  const filePath = getFilePath(absImportFrom);

  // @ts-ignore
  const isNodeBuiltinModule = !!process.binding('natives')[importFrom];

  // useful while running with target = electron-renderer
  if (isNodeBuiltinModule) {
    if (ignoreNodeBuiltInModules) {
      return `
const _ = require('${importFrom}');
module.exports = _;
      `;
    } else {
      return [
        `import _ from '${importFrom}';`,
        `export default _;`,
        `export * from '${importFrom}';`,
      ].join('\n');
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
