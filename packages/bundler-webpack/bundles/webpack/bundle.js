import webpack from 'webpack';
export default webpack;
export * from 'webpack';

// export webpack rules
const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')
const ObjectMatcherRulePlugin = require('webpack/lib/rules/ObjectMatcherRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler')

export {
  BasicEffectRulePlugin,
  BasicMatcherRulePlugin,
  UseEffectRulePlugin,
  ObjectMatcherRulePlugin,
  RuleSetCompiler,
}
