module.exports = {
  codeFrame: () => require('@babel/code-frame'),
  core: () => require('@babel/core'),
  parser: () => require('@babel/parser'),
  template: () => require('@babel/template'),
  generator: () => require('@babel/generator'),
  register: () => require('@babel/register'),
  traverse: () => require('@babel/traverse'),
  types: () => require('@babel/types'),
  presetEnv: () => require('@babel/preset-env'),
  presetReact: () => require('@babel/preset-react'),
  presetTypescript: () => require('@babel/preset-typescript'),
};
