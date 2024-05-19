import webpack from 'webpack';
export default webpack;
export * from 'webpack';

// export webpack rules
const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')
const ObjectMatcherRulePlugin = require('webpack/lib/rules/ObjectMatcherRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler')

// refer to nextjs https://github.com/vercel/next.js/blob/canary/packages/next/src/bundles/webpack/bundle5.js
const BasicEvaluatedExpression =require('webpack/lib/javascript/BasicEvaluatedExpression')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin')
const WebWorkerTemplatePlugin = require('webpack/lib/webworker/WebWorkerTemplatePlugin')
const FetchCompileAsyncWasmPlugin = require('webpack/lib/web/FetchCompileAsyncWasmPlugin')
const FetchCompileWasmPlugin = require('webpack/lib/web/FetchCompileWasmPlugin')
const StringXor = require('webpack/lib/util/StringXor')

// babel-plugin-react-css-modules
const TemplatedPathPlugin = require('webpack/lib/TemplatedPathPlugin')
const createHash = require('webpack/lib/util/createHash')

// mf v2
// const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')
// const Module = require('webpack/lib/Module')
// const WebpackError = require('webpack/lib/WebpackError')
// const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
// const Dependency = require('webpack/lib/Dependency')
// const RuntimeModule = require('webpack/lib/RuntimeModule')
// const ExternalModule = require('webpack/lib/ExternalModule')
const StartupChunkDependenciesPlugin = require('webpack/lib/runtime/StartupChunkDependenciesPlugin')
const identifier = require('webpack/lib/util/identifier')
const compileBooleanMatcher = require('webpack/lib/util/compileBooleanMatcher')
const SortableSet = require('webpack/lib/util/SortableSet')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const NodeEnvironmentPlugin = require('webpack/lib/node/NodeEnvironmentPlugin')
const makeSerializable = require('webpack/lib/util/makeSerializable')
const StaticExportsDependency = require('webpack/lib/dependencies/StaticExportsDependency')
const EntryDependency = require('webpack/lib/dependencies/EntryDependency')
const ModuleFactory = require('webpack/lib/ModuleFactory')
const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency')
const ResolverFactory = require('webpack/lib/ResolverFactory')
const FileSystemInfo = require('webpack/lib/FileSystemInfo')
const ObjectMiddleware = require('webpack/lib/serialization/ObjectMiddleware')
const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal')
const semver = require('webpack/lib/util/semver')
const ModuleNotFoundError = require('webpack/lib/ModuleNotFoundError')
const LazySet = require('webpack/lib/util/LazySet')
const fs = require('webpack/lib/util/fs')
const comparators = require('webpack/lib/util/comparators')
const ConsumeSharedModule = require('webpack/lib/sharing/ConsumeSharedModule')

const JavascriptHotModuleReplacementRuntime = require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js')
const createSchemaValidation = require('webpack/lib/util/create-schema-validation')

const ExternalsTypeCheck = require("webpack/schemas/plugins/container/ExternalsType.check.js")
const ConsumeSharedPluginCheck = require("webpack/schemas/plugins/sharing/ConsumeSharedPlugin.check.js")

export {
  BasicEffectRulePlugin,
  BasicMatcherRulePlugin,
  UseEffectRulePlugin,
  ObjectMatcherRulePlugin,
  RuleSetCompiler,

  BasicEvaluatedExpression,
  NodeTargetPlugin,
  NodeTemplatePlugin,
  LimitChunkCountPlugin,
  WebWorkerTemplatePlugin,
  FetchCompileAsyncWasmPlugin,
  FetchCompileWasmPlugin,
  StringXor,

  TemplatedPathPlugin,
  createHash,

  StartupChunkDependenciesPlugin,
  identifier,
  compileBooleanMatcher,
  SortableSet,
  ModuleFederationPlugin,
  NodeEnvironmentPlugin,
  makeSerializable,
  StaticExportsDependency,
  EntryDependency,
  ModuleFactory,
  ModuleDependency,
  ResolverFactory,
  FileSystemInfo,
  ObjectMiddleware,
  extractUrlAndGlobal,
  semver,
  ModuleNotFoundError,
  LazySet,
  fs,
  comparators,
  ConsumeSharedModule,
  JavascriptHotModuleReplacementRuntime,
  createSchemaValidation,
  ExternalsTypeCheck,
  ConsumeSharedPluginCheck,
}
