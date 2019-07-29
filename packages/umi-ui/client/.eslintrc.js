const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.default,
  rules: {
    ...fabric.default.rules,
    '@typescript-eslint/interface-name-prefix': [0],
    'jsx-a11y/alt-text': [0],
    'arrow-parens': [0],
    'react/button-has-type': [0],
    'lines-between-class-members': [0],
    'no-param-reassign': [0],
    'eslint-comments/no-unlimited-disable': [0],
  },
};
