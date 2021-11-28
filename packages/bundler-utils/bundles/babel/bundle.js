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
  pluginProposalExportNamespaceFrom: () =>
    require('@babel/plugin-proposal-export-namespace-from'),
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
};
