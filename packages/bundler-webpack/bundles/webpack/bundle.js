import webpack from 'webpack';
export default webpack;
export * from 'webpack';

// export webpack rules
const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')
const ObjectMatcherRulePlugin = require('webpack/lib/rules/ObjectMatcherRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler')

// workerize-loader
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const WebWorkerTemplatePlugin = require('webpack/lib/webworker/WebWorkerTemplatePlugin')

export {
  BasicEffectRulePlugin,
  BasicMatcherRulePlugin,
  UseEffectRulePlugin,
  ObjectMatcherRulePlugin,
  RuleSetCompiler,

  NodeTargetPlugin,
  WebWorkerTemplatePlugin
}
