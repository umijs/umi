import { traverse } from '@umijs/utils';
import { parse } from '../utils/parse';

export function isReactComponent(code: string) {
  const ast = parse(code);
  let hasJSXElement = false;
  traverse.default(ast, {
    JSXElement(path: any) {
      hasJSXElement = true;
      path.stop();
    },
    JSXFragment(path: any) {
      hasJSXElement = true;
      path.stop();
    },
  });
  return hasJSXElement;
}
