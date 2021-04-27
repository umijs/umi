/* eslint-disable import/no-extraneous-dependencies */

module.exports = function () {
  return {
    // inner imports
    Chunk: require('webpack5/lib/Chunk'),
    Compilation: require('webpack5/lib/Compilation'),
    ConstDependency: require('webpack5/lib/dependencies/ConstDependency'),
    ExternalsPlugin: require('webpack5/lib/ExternalsPlugin'),
    JavascriptParserHelpers: require('webpack5/lib/javascript/JavascriptParserHelpers'),
    LibraryTemplatePlugin: require('webpack5/lib/LibraryTemplatePlugin'),
    NodeTargetPlugin: require('webpack5/lib/node/NodeTargetPlugin'),
    NodeTemplatePlugin: require('webpack5/lib/node/NodeTemplatePlugin'),
    ModuleFilenameHelpers: require('webpack5/lib/ModuleFilenameHelpers'),
    NormalModule: require('webpack5/lib/NormalModule'),
    RequestShortener: require('webpack5/lib/RequestShortener'),
    RuntimeGlobals: require('webpack5/lib/RuntimeGlobals'),
    RuntimeModule: require('webpack5/lib/RuntimeModule'),
    LimitChunkCountPlugin: require('webpack5/lib/optimize/LimitChunkCountPlugin'),
    LoaderTargetPlugin: require('webpack5/lib/LoaderTargetPlugin'),
    // ParserHelpers: require('webpack5/lib/ParserHelpers'),
    // SingleEntryPlugin: require('webpack5/lib/SingleEntryPlugin'),
    Template: require('webpack5/lib/Template'),
    FetchCompileAsyncWasmPlugin: require('webpack5/lib/web/FetchCompileAsyncWasmPlugin'),
    FetchCompileWasmPlugin: require('webpack5/lib/web/FetchCompileWasmPlugin'),
    // FetchCompileWasmTemplatePlugin: require('webpack5/lib/web/FetchCompileWasmTemplatePlugin'),
    WebWorkerTemplatePlugin: require('webpack5/lib/webworker/WebWorkerTemplatePlugin'),

    pkgInfo: require('webpack5/package'),
    sources: require('webpack5').sources,
    webpack: require('webpack5'),
  }
}
