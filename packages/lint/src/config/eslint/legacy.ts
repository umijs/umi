import rules, { typescript as tsRules } from './rules/fabric';
import './setup';

module.exports = {
  extends: ['prettier', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-hooks'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules,
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      rules: tsRules,
      extends: ['prettier', 'plugin:@typescript-eslint/recommended'],
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      presets: [require.resolve('@umijs/babel-preset-umi')],
    },
    requireConfigFile: false,
  },
};
