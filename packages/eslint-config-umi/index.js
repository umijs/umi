const {
  configs: { recommended: typescriptEslintRecommended },
} = require('@typescript-eslint/eslint-plugin');
const typescriptEslintPrettier = require('eslint-config-prettier/@typescript-eslint');

module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'plugin:compat/recommended', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    APP_TYPE: true,
    page: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [
      2,
      {
        optionalDependencies: true,
        devDependencies: ['**/tests/**.js', '/mock/**/**.js', '**/**.test.js'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
    'prettier/prettier': 1,
  },
  settings: {
    polyfills: ['fetch', 'promises', 'url'],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
      },
      settings: {
        'import/resolver': {
          node: {
            // Allow import and resolve for *.ts modules.
            extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.d.ts'],
          },
        },
      },
      plugins: ['@typescript-eslint'],
      // workaround before support extends in overrides: https://github.com/eslint/eslint/issues/8813
      rules: Object.assign(
        typescriptEslintRecommended.rules,
        typescriptEslintPrettier.rules,
        {
          /** https://github.com/eslint/eslint/issues/11464 */
          'no-useless-constructor': 'off',
          '@typescript-eslint/no-useless-constructor': 'warn',
          /** https://github.com/yannickcr/eslint-plugin-react/issues/2187 */
          'react/prefer-stateless-function': 'off',
          'react/jsx-filename-extension': [1, { extensions: ['.ts'] }],
        },
      ),
    },
  ],
};
