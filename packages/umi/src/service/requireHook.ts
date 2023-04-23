import { join } from 'path';

const hookPropertyMap = new Map([
  ['umi', join(__dirname, '../index.js')],
  ['umi/plugin-utils', join(__dirname, '../../plugin-utils.js')],
]);

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
