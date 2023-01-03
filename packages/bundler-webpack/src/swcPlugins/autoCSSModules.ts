import type { ImportDeclaration, ModuleItem, TsType } from '@swc/core';
import Visitor from '@swc/core/Visitor';
import { isStyleFile } from '@umijs/utils';
import { changeImportFromString } from './changeImportFromString';

class AutoCSSModule extends Visitor {
  visitTsType(expression: TsType) {
    return expression;
  }

  /**
   * call path:
   *   visitProgram -> visitModule -> visitModuleItems -> visitModuleItem -> visitImportDeclaration
   * @see https://github.com/swc-project/swc/blob/main/node-swc/src/Visitor.ts#L189
   */
  visitModuleItem(n: ModuleItem) {
    if (n.type === 'ImportDeclaration') {
      return this.visitImportDeclaration(n);
    }
    return n;
  }

  visitImportDeclaration(expression: ImportDeclaration): ImportDeclaration {
    const { specifiers, source } = expression;
    const { value } = source;

    if (specifiers.length && isStyleFile({ filename: value })) {
      const newImportFrom = `${value}?modules`;
      changeImportFromString(expression, newImportFrom);
    }
    return expression;
  }
}

/**
 * @deprecated Swc will not support js plugin in the future.
 * See https://github.com/swc-project/website/commit/fde42ad5371c1a16ca9729fe17bcfd3489841ac1
 */
export default AutoCSSModule;
