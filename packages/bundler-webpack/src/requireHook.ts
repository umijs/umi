// MIT: copy from https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/require-hook.ts
// sync injects a hook for webpack and webpack/... requires to use the internal ncc webpack version
// this is in order for userland plugins to attach to the same webpack instance as umi
// the individual compiled modules are as defined for the compilation in bundles/webpack/packages/*

import { join } from 'path';
// @ts-ignore
import deepImports from '../compiled/webpack/deepImports.json';

const resolveCompiledDepPath = (subpath: string) => {
  return join(__dirname, '../compiled', subpath);
};

const hookPropertyMap = new Map([
  ['webpack', resolveCompiledDepPath('webpack')],
  ['webpack/package', resolveCompiledDepPath('webpack/package')],
  ['webpack/package.json', resolveCompiledDepPath('webpack/package')],
  ['webpack/lib/webpack', resolveCompiledDepPath('webpack')],
  ['webpack/lib/webpack.js', resolveCompiledDepPath('webpack')],
]);

deepImports.forEach((item: string) => {
  const name = item.split('/').pop();
  hookPropertyMap.set(item, resolveCompiledDepPath(`webpack/${name}`));
  hookPropertyMap.set(`${item}.js`, resolveCompiledDepPath(`webpack/${name}`));
});

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
