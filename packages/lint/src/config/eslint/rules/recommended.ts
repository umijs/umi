/**
 * recommended enabled/disabled rules for umi project
 * @note  base on recommended rule set from loaded eslint plugins
 */
export default {
  // eslint built-in rules
  // 不需要返回就用 forEach
  'array-callback-return': 2,
  // eqeq 可能导致潜在的类型转换问题
  eqeqeq: 2,
  'for-direction': 2,
  // 不加 hasOwnProperty 判断会多出原型链的内容
  'guard-for-in': 2,
  'no-async-promise-executor': 2,
  'no-case-declarations': 2,
  'no-debugger': 2,
  'no-delete-var': 2,
  'no-dupe-else-if': 2,
  'no-duplicate-case': 2,
  // eval（）可能导致潜在的安全问题
  'no-eval': 2,
  'no-ex-assign': 2,
  'no-global-assign': 2,
  'no-invalid-regexp': 2,
  // 没必要改 native 变量
  'no-native-reassign': 2,
  // 修改对象时，会影响原对象；但是有些场景就是有目的
  'no-param-reassign': 2,
  // return 值无意义，可能会理解为 resolve
  'no-promise-executor-return': 2,
  'no-self-assign': 2,
  'no-self-compare': 2,
  'no-shadow-restricted-names': 2,
  'no-sparse-arrays': 2,
  'no-unsafe-finally': 2,
  'no-unused-labels': 2,
  'no-useless-catch': 2,
  'no-useless-escape': 2,
  'no-var': 2,
  'no-with': 2,
  'require-yield': 2,
  'use-isnan': 2,

  // config-plugin-react rules
  // button 自带 submit 属性
  'react/button-has-type': 2,
  'react/jsx-key': 2,
  'react/jsx-no-comment-textnodes': 2,
  'react/jsx-no-duplicate-props': 2,
  'react/jsx-no-target-blank': 2,
  'react/jsx-no-undef': 2,
  'react/jsx-uses-react': 2,
  'react/jsx-uses-vars': 2,
  'react/no-children-prop': 2,
  'react/no-danger-with-children': 2,
  'react/no-deprecated': 2,
  'react/no-direct-mutation-state': 2,
  'react/no-find-dom-node': 2,
  'react/no-is-mounted': 2,
  'react/no-string-refs': 2,
  'react/no-render-return-value': 2,
  'react/no-unescaped-entities': 2,
  'react/no-unknown-property': 2,
  'react/require-render-return': 2,

  // config-plugin-jest rules
  'jest/no-conditional-expect': 2,
  'jest/no-deprecated-functions': 2,
  'jest/no-export': 2,
  'jest/no-focused-tests': 2,
  'jest/no-identical-title': 2,
  'jest/no-interpolation-in-snapshots': 2,
  'jest/no-jasmine-globals': 2,
  'jest/no-jest-import': 2,
  'jest/no-mocks-import': 2,
  'jest/no-standalone-expect': 2,
  'jest/valid-describe-callback': 2,
  'jest/valid-expect-in-promise': 2,
  'jest/valid-expect': 2,
  'jest/valid-title': 2,

  // config-plugin-react-hooks rules
  'react-hooks/rules-of-hooks': 2,
};

/**
 * recommended enabled/disabled rules for typescript umi project
 * @note  base on recommended rule set from loaded eslint plugins
 */
export const typescript = {
  // config-plugin-typescript rules
  '@typescript-eslint/ban-types': 2,
  '@typescript-eslint/no-confusing-non-null-assertion': 2,
  '@typescript-eslint/no-dupe-class-members': 2,
  '@typescript-eslint/no-empty-interface': 2,
  '@typescript-eslint/no-for-in-array': 2,
  '@typescript-eslint/no-invalid-this': 2,
  '@typescript-eslint/no-loop-func': 2,
  '@typescript-eslint/no-misused-new': 2,
  '@typescript-eslint/no-namespace': 2,
  '@typescript-eslint/no-non-null-asserted-optional-chain': 2,
  '@typescript-eslint/no-redeclare': 2,
  '@typescript-eslint/no-this-alias': 2,
  // '@typescript-eslint/no-unsafe-argument': 2,
  '@typescript-eslint/no-unused-expressions': 2,
  '@typescript-eslint/no-unused-vars': 2,
  '@typescript-eslint/no-use-before-define': 2,
  '@typescript-eslint/no-useless-constructor': 2,
  '@typescript-eslint/triple-slash-reference': 2,
};
