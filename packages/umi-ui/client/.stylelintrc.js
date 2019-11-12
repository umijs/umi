module.exports = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-css-modules',
    'stylelint-config-prettier',
  ],
  rules: {
    'block-opening-brace-space-before': 'always',
    'declaration-colon-space-after': 'always',
    'font-family-no-missing-generic-family-keyword': null,
    'at-rule-no-unknown': null,
    'no-descending-specificity': null,
    'no-empty-source': null,
    'selector-pseudo-class-no-unknown': null,
    'block-no-empty': null,
  },
};
