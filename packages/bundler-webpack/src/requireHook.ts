export const files = [
  'webpack/lib/Chunk',
  'webpack/lib/Compilation',
  'webpack/lib/dependencies/ConstDependency',
  'webpack/lib/javascript/JavascriptParserHelpers',
  'webpack/lib/LibraryTemplatePlugin',
  'webpack/lib/LoaderTargetPlugin',
  'webpack/lib/node/NodeTargetPlugin',
  'webpack/lib/node/NodeTemplatePlugin',
  'webpack/lib/ModuleFilenameHelpers',
  'webpack/lib/NormalModule',
  'webpack/lib/RequestShortener',
  'webpack/lib/RuntimeGlobals',
  'webpack/lib/RuntimeModule',
  'webpack/lib/optimize/LimitChunkCountPlugin',
  'webpack/lib/ParserHelpers',
  'webpack/lib/SingleEntryPlugin',
  'webpack/lib/Template',
  'webpack/lib/webworker/WebWorkerTemplatePlugin',
];

export function getFileName(filePath: string) {
  return filePath.split('/').slice(-1)[0];
}

let inited = false;

export function init() {
  // Allow run once
  if (inited) return;
  inited = true;

  const filesMap = files.map((file) => {
    const fileName = getFileName(file);
    return [file, `@umijs/deps/compiled/webpack/${fileName}`];
  });

  const hookPropertyMap = new Map(
    [
      ['webpack', '@umijs/deps/compiled/webpack'],
      ['webpack/package.json', '@umijs/deps/compiled/webpack/pkgInfo'],
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
