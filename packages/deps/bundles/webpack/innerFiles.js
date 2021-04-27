const { writeFileSync } = require('fs');
const { join } = require('path');

const files = [
  'webpack/lib/Chunk',
  'webpack/lib/Compilation',
  'webpack/lib/dependencies/ConstDependency',
  'webpack/lib/ExternalsPlugin',
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
  'webpack/lib/web/FetchCompileAsyncWasmPlugin',
  'webpack/lib/web/FetchCompileWasmPlugin',
  'webpack/lib/web/FetchCompileWasmTemplatePlugin',
  'webpack/lib/webworker/WebWorkerTemplatePlugin',
];

function getFileName(filePath) {
  return filePath.split('/').slice(-1)[0];
}

exports.getBundle4Map = function () {
  return files.reduce((memo, file) => {
    const fileName = getFileName(file);
    memo[fileName] = `require('${file}')`;
    return memo;
  }, {});
}

exports.getBundle5Map = function () {
  return files.reduce((memo, file) => {
    const fileName = getFileName(file);
    memo[fileName] = `require('${file.replace(/^webpack/, 'webpack5')}')`;
    return memo;
  }, {});
}

exports.getExternalsMap = function () {
  return files.reduce((memo, file) => {
    const fileName = getFileName(file);
    memo[file] = `@umijs/deps/compiled/webpack/${fileName}`;
    return memo;
  }, {});
}

exports.generatePackageFiles = function () {
  const baseDir = join(__dirname, 'packages');
  files.forEach(file => {
    const fileName = getFileName(file);
    writeFileSync(
      join(baseDir, `${fileName}.js`),
      `module.exports = require('./webpack.js').${fileName};\n`,
      'utf-8',
    )
  });
  console.log('packages generated');
}
