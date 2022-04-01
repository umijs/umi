/**
 * rules migrate from @umijs/fabric/dist/stylelint.js
 * @see https://github.com/umijs/fabric/blob/master/src/stylelint.ts
 */
module.exports = {
  extends: [
    require.resolve('stylelint-config-standard'),
    require.resolve('../../../compiled/stylelint-config-prettier'),
    require.resolve('../../../compiled/stylelint-config-css-modules'),
  ],
  plugins: [
    require.resolve(
      '../../../compiled/stylelint-declaration-block-no-ignored-properties',
    ),
  ],
  rules: {
    'no-descending-specificity': null,
    'function-url-quotes': 'always',
    'selector-attribute-quotes': 'always',
    'font-family-no-missing-generic-family-keyword': null, // iconfont
    'plugin/declaration-block-no-ignored-properties': true,
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // webcomponent
    'selector-type-no-unknown': null,
    'value-keyword-case': ['lower', { ignoreProperties: ['composes'] }],
  },
  customSyntax: require.resolve('../../../compiled/postcss-less'),
  ignoreFiles: ['node_modules'],
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      customSyntax: require.resolve('@stylelint/postcss-css-in-js'),
    },
  ],
};
