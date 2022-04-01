/**
 * legay enabled/disabled rules from @umijs/fabric tsEslintConfig
 * @see https://github.com/umijs/fabric/blob/master/src/tsEslintConfig.ts
 */
export const typescript = {
  // eslint built-in rules
  'no-dupe-class-members': 0,
  'no-redeclare': 0,
  'no-undef': 0,
  'no-unused-vars': 0,

  // @typescript-eslint rules
  '@typescript-eslint/adjacent-overload-signatures': 0,
  '@typescript-eslint/array-type': 2,
  '@typescript-eslint/await-thenable': 0,
  '@typescript-eslint/ban-ts-comment': 0,
  '@typescript-eslint/ban-types': 1,
  '@typescript-eslint/consistent-indexed-object-style': 1,
  '@typescript-eslint/consistent-type-imports': 1,
  '@typescript-eslint/dot-notation': 1,
  '@typescript-eslint/method-signature-style': 2,
  '@typescript-eslint/no-array-constructor': 0,
  '@typescript-eslint/no-confusing-non-null-assertion': 2,
  '@typescript-eslint/no-dupe-class-members': 2,
  '@typescript-eslint/no-empty-function': 0,
  '@typescript-eslint/no-empty-interface': 1,
  '@typescript-eslint/no-explicit-any': 0,
  '@typescript-eslint/no-extra-non-null-assertion': 0,
  '@typescript-eslint/no-floating-promises': 0,
  '@typescript-eslint/no-implied-eval': 0,
  '@typescript-eslint/no-inferrable-types': 0,
  '@typescript-eslint/no-invalid-this': 1,
  '@typescript-eslint/no-loop-func': 2,
  '@typescript-eslint/no-loss-of-precision': 0,
  '@typescript-eslint/no-misused-promises': 0,
  '@typescript-eslint/no-namespace': 1,
  '@typescript-eslint/no-non-null-assertion': 0,
  '@typescript-eslint/no-parameter-properties': 2,
  '@typescript-eslint/no-redeclare': 2,
  '@typescript-eslint/no-shadow': 2,
  '@typescript-eslint/no-throw-literal': 2,
  '@typescript-eslint/no-unnecessary-type-assertion': 0,
  '@typescript-eslint/no-unnecessary-type-constraint': 0,
  '@typescript-eslint/no-unsafe-assignment': 0,
  '@typescript-eslint/no-unsafe-call': 0,
  '@typescript-eslint/no-unsafe-member-access': 0,
  '@typescript-eslint/no-unsafe-return': 0,
  '@typescript-eslint/no-unused-expressions': 2,
  '@typescript-eslint/no-unused-vars': [
    'error',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
  ],
  '@typescript-eslint/no-use-before-define': [
    'error',
    { functions: false, classes: true, variables: true, typedefs: true },
  ],
  '@typescript-eslint/no-useless-constructor': 2,
  '@typescript-eslint/no-var-requires': 0,
  '@typescript-eslint/prefer-as-const': 0,
  '@typescript-eslint/prefer-namespace-keyword': 0,
  '@typescript-eslint/require-await': 0,
  '@typescript-eslint/restrict-plus-operands': 0,
  '@typescript-eslint/restrict-template-expressions': 0,
  '@typescript-eslint/switch-exhaustiveness-check': 2,
  '@typescript-eslint/type-annotation-spacing': 2,
  '@typescript-eslint/typedef': 2,
  '@typescript-eslint/unbound-method': 0,
  '@typescript-eslint/unified-signatures': 2,
};

/**
 * legay enabled/disabled rules from @umijs/fabric
 * @see https://github.com/umijs/fabric/blob/master/src/eslint.ts#L54
 */
export default {
  // eslint built-in rules
  'no-param-reassign': 2,
  'no-prototype-builtins': 0,

  // eslint-plugin-react rules
  'react/display-name': 0,
  'react/jsx-key': 1,
  'react/no-array-index-key': 1,
  'react/prop-types': 0,
  'react/react-in-jsx-scope': 0,
  'react/self-closing-comp': 1,

  // eslint-pluginr-react-hooks rules
  'react-hooks/exhaustive-deps': 1,
  'react-hooks/rules-of-hooks': 2,
};
