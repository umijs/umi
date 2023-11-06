// Babel >= 7.22.0 renamed packages
// https://babeljs.io/blog/2023/05/26/7.22.0
const babelTransformDeps = {
  exportNamespaceFrom: () => require('@babel/plugin-transform-export-namespace-from'),
  classProperties: () => require('@babel/plugin-transform-class-properties'),
  privateMethods: () => require('@babel/plugin-transform-private-methods'),
  privatePropertyInObject: () => require('@babel/plugin-transform-private-property-in-object')
}

module.exports = {
  codeFrame: () => require('@babel/code-frame'),
  core: () => require('@babel/core'),
  generator: () => require('@babel/generator'),
  helperModuleImports: () => require('@babel/helper-module-imports'),
  parser: () => require('@babel/parser'),

  // tc39
  pluginProposalDecorators: () => require('@babel/plugin-proposal-decorators'),
  pluginProposalDoExpressions: () =>
    require('@babel/plugin-proposal-do-expressions'),
  pluginProposalExportDefaultFrom: () =>
    require('@babel/plugin-proposal-export-default-from'),
  pluginProposalExportNamespaceFrom: babelTransformDeps.exportNamespaceFrom,
  pluginTransformExportNamespaceFrom: babelTransformDeps.exportNamespaceFrom,
  pluginProposalFunctionBind: () =>
    require('@babel/plugin-proposal-function-bind'),
  pluginProposalPartialApplication: () =>
    require('@babel/plugin-proposal-partial-application'),
  pluginProposalPipelineOperator: () =>
    require('@babel/plugin-proposal-pipeline-operator'),
  pluginProposalRecordAndTuple: () =>
    require('@babel/plugin-proposal-record-and-tuple'),

  pluginTransformRuntime: () => require('@babel/plugin-transform-runtime'),

  // preset
  presetEnv: () => require('@babel/preset-env'),
  presetReact: () => require('@babel/preset-react'),
  presetTypescript: () => require('@babel/preset-typescript'),

  register: () => require('@babel/register'),
  template: () => require('@babel/template'),
  traverse: () => require('@babel/traverse'),
  types: () => require('@babel/types'),

  // class-properties: class 使用 loose 模式需要
  pluginProposalClassProperties: babelTransformDeps.classProperties,
  pluginTransformClassProperties: babelTransformDeps.classProperties,
  // private-methods
  pluginProposalPrivateMethods: babelTransformDeps.privateMethods,
  pluginTransformPrivateMethods: babelTransformDeps.privateMethods,
  // private-property-in-object
  pluginProposalPrivatePropertyInObject: babelTransformDeps.privatePropertyInObject,
  pluginTransformPrivatePropertyInObject: babelTransformDeps.privatePropertyInObject
};
