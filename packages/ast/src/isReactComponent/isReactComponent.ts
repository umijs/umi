import { t, parser, traverse } from '@umijs/utils';

export function isReactComponent(code: string) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  let hasJSXElement = false;
  traverse.default(ast, {
    JSXElement() {
      hasJSXElement = true;
    },
  });
  return hasJSXElement;
}
