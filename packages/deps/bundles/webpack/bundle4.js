/* eslint-disable import/no-extraneous-dependencies */

module.exports = function () {
  return {
    // inner imports
    Chunk: require('webpack/lib/Chunk'),
    Compilation: require('webpack/lib/Compilation'),
    ConstDependency: require('webpack/lib/dependencies/ConstDependency'),
    ExternalsPlugin: require('webpack/lib/ExternalsPlugin'),
    // JavascriptParserHelpers: require('webpack/lib/javascript/JavascriptParserHelpers'),
    LibraryTemplatePlugin: require('webpack/lib/LibraryTemplatePlugin'),
    NodeTargetPlugin: require('webpack/lib/node/NodeTargetPlugin'),
    NodeTemplatePlugin: require('webpack/lib/node/NodeTemplatePlugin'),
    ModuleFilenameHelpers: require('webpack/lib/ModuleFilenameHelpers'),
    NormalModule: require('webpack/lib/NormalModule'),
    RequestShortener: require('webpack/lib/RequestShortener'),
    // RuntimeGlobals: require('webpack/lib/RuntimeGlobals'),
    // RuntimeModule: require('webpack/lib/RuntimeModule'),
    LimitChunkCountPlugin: require('webpack/lib/optimize/LimitChunkCountPlugin'),
    LoaderTargetPlugin: require('webpack/lib/LoaderTargetPlugin'),
    ParserHelpers: require('webpack/lib/ParserHelpers'),
    SingleEntryPlugin: require('webpack/lib/SingleEntryPlugin'),
    Template: require('webpack/lib/Template'),
    // FetchCompileAsyncWasmPlugin: require('webpack/lib/web/FetchCompileAsyncWasmPlugin'),
    // FetchCompileWasmPlugin: require('webpack/lib/web/FetchCompileWasmPlugin'),
    FetchCompileWasmTemplatePlugin: require('webpack/lib/web/FetchCompileWasmTemplatePlugin'),
    WebWorkerTemplatePlugin: require('webpack/lib/webworker/WebWorkerTemplatePlugin'),

    pkgInfo: require('webpack/package'),
    sources: require('webpack-sources'),
    webpack: require('webpack'),
  }
}
