const hookPropertyMap = new Map(
  [
    ['webpack', '@umijs/deps/compiled/webpack'],
    ['webpack/lib/Compilation', '@umijs/deps/compiled/webpack/Compilation'],
    [
      'webpack/lib/RequestShortener',
      '@umijs/deps/compiled/webpack/RequestShortener',
    ],
    // ['webpack-sources', '@umijs/deps/compiled/webpack/sources'],
  ].map(([request, replacement]) => [request, require.resolve(replacement)]),
);

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
