import { existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { winPath } from 'umi-utils';

const JS_EXTNAMES = ['.vue'];

export function findJSFile(baseDir, fileNameWithoutExtname, fileExt = JS_EXTNAMES) {
  for (const extname of fileExt) {
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }
}

export function optsToArray(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export function isValidJS(file) {
  return JS_EXTNAMES.includes(extname(file));
}

export function endWithSlash(path) {
  return path.slice(-1) !== '/' ? `${path}/` : path;
}

function stripFirstSlash(path) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  } else {
    return path;
  }
}

export function chunkName(cwd, path) {
  return normalizeEntry(stripFirstSlash(winPath(path).replace(winPath(cwd), '')))
    .replace(/^src__/, '')
    .replace(/^pages__/, 'p__')
    .replace(/^page__/, 'p__');
}

function normalizeEntry(entry) {
  return entry
    .replace(/^.(\/|\\)/, '')
    .replace(/(\/|\\)/g, '__')
    .replace(/\.jsx?$/, '')
    .replace(/\.vue$/, '')
    .replace(/\.tsx?$/, '');
}
