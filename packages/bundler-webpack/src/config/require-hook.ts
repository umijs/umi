// MIT: copy from https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/require-hook.ts
// sync injects a hook for webpack and webpack/... requires to use the internal ncc webpack version
// this is in order for userland plugins to attach to the same webpack instance as umi
// the individual compiled modules are as defined for the compilation in bundles/webpack/packages/*

const hookPropertyMap = new Map([
  ['webpack', '@umijs/bundler-webpack/compiled/webpack/index'],
  ['webpack/package', '@umijs/bundler-webpack/compiled/webpack/package'],
  ['webpack/package.json', '@umijs/bundler-webpack/compiled/webpack/package'],
  ['webpack/lib/webpack', '@umijs/bundler-webpack/compiled/webpack/index'],
  ['webpack/lib/webpack.js', '@umijs/bundler-webpack/compiled/webpack/index'],
  [
    'webpack/lib/ModuleFilenameHelpers',
    '@umijs/bundler-webpack/compiled/webpack/ModuleFilenameHelpers',
  ],
  [
    'webpack/lib/ModuleFilenameHelpers.js',
    '@umijs/bundler-webpack/compiled/webpack/ModuleFilenameHelpers',
  ],
  ['webpack-sources', '@umijs/bundler-webpack/compiled/webpack-sources/index'],
  ['webpack-sources/lib', '@umijs/bundler-webpack/compiled/webpack-sources/index'],
  ['webpack-sources/lib/index', '@umijs/bundler-webpack/compiled/webpack-sources/index'],
  ['webpack-sources/lib/index.js', '@umijs/bundler-webpack/compiled/webpack-sources/index'],
])

const mod = require('module')
const resolveFilename = mod._resolveFilename
mod._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any
) {
  const hookResolved = hookPropertyMap.get(request)
  if (hookResolved) request = hookResolved
  return resolveFilename.call(mod, request, parent, isMain, options)
}