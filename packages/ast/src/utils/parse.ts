import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function parse(code: string): t.File {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy',
    ],
    allowAwaitOutsideFunction: true,
  });
}
