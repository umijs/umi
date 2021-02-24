export const files = [
  'webpack/lib/Compilation',
  'webpack/lib/dependencies/ConstDependency',
  'webpack/lib/javascript/JavascriptParserHelpers',
  'webpack/lib/LibraryTemplatePlugin',
  'webpack/lib/node/NodeTargetPlugin',
  'webpack/lib/node/NodeTemplatePlugin',
  'webpack/lib/NormalModule',
  'webpack/lib/RequestShortener',
  'webpack/lib/RuntimeGlobals',
  'webpack/lib/RuntimeModule',
  'webpack/lib/optimize/LimitChunkCountPlugin',
  'webpack/lib/ParserHelpers',
  'webpack/lib/SingleEntryPlugin',
  'webpack/lib/Template',
];

export function getFileName(filePath: string) {
  return filePath.split('/').slice(-1)[0];
}

export function init() {
  const filesMap = files.map((file) => {
    const fileName = getFileName(file);
    return [file, `@umijs/deps/compiled/webpack/${fileName}`];
  });

  const hookPropertyMap = new Map(
    [
      ['webpack', '@umijs/deps/compiled/webpack'],
      ...filesMap,
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
}
