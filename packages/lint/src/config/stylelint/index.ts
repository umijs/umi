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
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*(-[a-z0-9]+)*|[a-z][a-zA-Z0-9]+)$',
      {
        message: 'Expected class selector to be kebab-case or lowerCamelCase',
      },
    ],
    // to avoid conflicts with less option { math: always }
    // ref: https://github.com/less/less-docs/blob/c8b9d33b0b4ec5fe59a4bbda11db202545741228/content/usage/less-options.md#math
    'color-function-notation': null,
    // disallowed set single font-family as PingFangSC
    // in most cases, this font-family rule is copied unconsciously from Sketch
    // and it will cause an unexpected font rendering on the devices that have no PingFangSC font
    'declaration-property-value-disallowed-list': [
      {
        'font-family':
          '/^(\'|")?PingFangSC(-(Regular|Medium|Semibold|Bold))?\\1$/',
      },
      {
        message:
          'Unexpected value for property "font-family", which will cause some devices to render the wrong font, please delete this "font-family" css rule, see also: https://github.com/umijs/umi/pull/11001',
      },
    ],
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
