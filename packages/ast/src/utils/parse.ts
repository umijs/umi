import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import type { ParserPlugin } from '@umijs/bundler-utils/compiled/babel/parser';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function parse(
  code: string,
  opts: {
    excludePlugins?: ParserPlugin[];
    includePlugins?: ParserPlugin[];
  } = {},
): t.File {
  const excludePlugins = opts.excludePlugins || [];
  const includePlugins = opts.includePlugins || [];
  const plugins = (
    [
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
      ...includePlugins,
    ] as ParserPlugin[]
  ).filter((p) => {
    return !excludePlugins.includes(p);
  });
  return parser.parse(code, {
    sourceType: 'module',
    plugins,
    allowAwaitOutsideFunction: true,
  });
}
