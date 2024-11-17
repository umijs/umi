import rules, { typescript as tsRules } from './rules/fabric';
import './setup';

module.exports = {
  extends: ['prettier', 'plugin:react/recommended'],
  parser: require.resolve('@babel/eslint-parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
      rules: tsRules,
      extends: ['prettier', 'plugin:@typescript-eslint/recommended'],
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      babelrc: false,
      configFile: false,
      browserslistConfigFile: false,
      presets: [require.resolve('@umijs/babel-preset-umi')],
    },
    requireConfigFile: false,
    warnOnUnsupportedTypeScriptVersion: false,
  },
};
