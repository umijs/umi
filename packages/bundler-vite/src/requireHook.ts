// 解决 vite 插件 内部使用了 vite 导致的报错
import { join } from 'path';

const PKG_ROOT = join(__dirname, '../');
const resolve = (p: string) => join(PKG_ROOT, p);

const hookPropertyMap = new Map([['vite', resolve('compiled/vite')]]);

const mod = require('module');
const resolveFilename = mod._resolveFilename;
mod._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any,
) {
  const hookResolved = hookPropertyMap.get(request);
  if (hookResolved) request = hookResolved;
  return resolveFilename.call(mod, request, parent, isMain, options);
};
