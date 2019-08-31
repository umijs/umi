const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.default,
  rules: {
    ...fabric.default.rules,
    '@typescript-eslint/interface-name-prefix': [0],
    '@typescript-eslint/array-type': [0],
    'jsx-a11y/alt-text': [0],
    'global-require': [0],
    'arrow-parens': [0],
    'react/button-has-type': [0],
    'lines-between-class-members': [0],
    'no-param-reassign': [0],
    'class-methods-use-this': [0],
    'no-underscore-dangle': [0],
    'import/no-extraneous-dependencies': [0],
    'constructor-super': [0],
    'no-confusing-arrow': [0],
    '@typescript-eslint/no-object-literal-type-assertion': [0],
    'eslint-comments/no-unlimited-disable': [0],
    'computed-property-spacing': [0],
    'import/no-unresolved': 0,
    'array-bracket-spacing': 0,
    'import/no-mutable-exports': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
