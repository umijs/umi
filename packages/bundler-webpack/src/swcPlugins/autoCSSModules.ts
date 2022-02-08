import type { ImportDeclaration, ModuleItem, TsType } from '@swc/core';
import Visitor from '@swc/core/Visitor';
import { isStyleFile } from '@umijs/utils';

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
      return {
        ...expression,
        source: {
          ...source,
          value: `${value}?modules`,
        },
      };
    }
    return expression;
  }
}

export default AutoCSSModule;
