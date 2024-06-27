// MIT: copy from https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/require-hook.ts
// sync injects a hook for webpack and webpack/... requires to use the internal ncc webpack version
// this is in order for userland plugins to attach to the same webpack instance as umi
// the individual compiled modules are as defined for the compilation in bundles/webpack/packages/*

// @ts-ignore
import deepImports from '@umijs/bundler-webpack/compiled/webpack/deepImports.json';
import { join } from 'path';

const PKG_ROOT = join(__dirname, '../');
const resolve = (p: string) => join(PKG_ROOT, p);

const hookPropertyMap = new Map([
  ['webpack', resolve('compiled/webpack')],
  ['webpack/package', resolve('compiled/webpack/package')],
  ['webpack/package.json', resolve('compiled/webpack/package')],
  ['webpack/lib/webpack', resolve('compiled/webpack')],
  ['webpack/lib/webpack.js', resolve('compiled/webpack')],
  ['tapable', require.resolve('@umijs/bundler-utils/compiled/tapable')],
]);

deepImports.forEach((item: string) => {
  const name = item.split('/').pop();
  const targetPath = resolve(`compiled/webpack/${name}`);
  const hookPathList: string[] = [item];
  const isJson = item.endsWith('.json');
  if (!isJson) {
    const isEndWithJs = item.endsWith('.js');
    if (isEndWithJs) {
      const nameWithoutJs = item.replace(/\.js$/, '');
      hookPathList.push(nameWithoutJs);
    } else {
      const nameWithJs = `${item}.js`;
      hookPathList.push(nameWithJs);
    }
  }
  hookPathList.forEach((hookPath) => {
    hookPropertyMap.set(hookPath, targetPath);
  });
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
