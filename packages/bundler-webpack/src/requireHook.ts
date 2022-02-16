// MIT: copy from https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/require-hook.ts
// sync injects a hook for webpack and webpack/... requires to use the internal ncc webpack version
// this is in order for userland plugins to attach to the same webpack instance as umi
// the individual compiled modules are as defined for the compilation in bundles/webpack/packages/*

// @ts-ignore
import deepImports from '@umijs/bundler-webpack/compiled/webpack/deepImports.json';

const hookPropertyMap = new Map([
  ['webpack', '@umijs/bundler-webpack/compiled/webpack'],
  ['webpack/package', '@umijs/bundler-webpack/compiled/webpack/package'],
  ['webpack/package.json', '@umijs/bundler-webpack/compiled/webpack/package'],
  ['webpack/lib/webpack', '@umijs/bundler-webpack/compiled/webpack'],
  ['webpack/lib/webpack.js', '@umijs/bundler-webpack/compiled/webpack'],
]);

deepImports.forEach((item: string) => {
  const name = item.split('/').pop();
  hookPropertyMap.set(item, `@umijs/bundler-webpack/compiled/webpack/${name}`);
  hookPropertyMap.set(
    `${item}.js`,
    `@umijs/bundler-webpack/compiled/webpack/${name}`,
  );
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
