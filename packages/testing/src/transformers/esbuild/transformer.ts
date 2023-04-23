import type { TransformOptions } from '@jest/transform';

require('./requireHook').hook();
const { createTransformer } = require('babel-jest');
require('./requireHook').unhook();

const { process } = createTransformer({
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  parserOpts: {
    plugins: ['jsx', 'typescript'],
  },
});

export interface BabelTransformOptions {
  sourceText: string;
  sourcePath: string;
  config: TransformOptions<any>;
}

export function babelTransform(opts: BabelTransformOptions) {
  const { sourceText, sourcePath, config } = opts;
  const babelResult = process(sourceText, sourcePath, config) as {
    code: string;
  };
  return babelResult.code;
}
