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
  StringXor
}
