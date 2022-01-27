import { ImportDeclaration, TsType, VariableDeclaration } from '@swc/core';
import Visitor from '@swc/core/Visitor';
import { isStyleFile } from '@umijs/utils';

class AutoCSSModule extends Visitor {
  visitTsType(expression: TsType) {
    return expression;
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

  visitVariableDeclaration(
    expression: VariableDeclaration,
  ): VariableDeclaration {
    const { declarations } = expression;
    if (
      declarations.length &&
      declarations[0].init &&
      declarations[0].init.type === 'AwaitExpression' &&
      declarations[0].init.argument.type === 'CallExpression' &&
      declarations[0].init.argument.arguments[0].expression.type ===
        'StringLiteral' &&
      isStyleFile({
        filename: declarations[0].init.argument.arguments[0].expression.value,
      })
    ) {
      declarations[0].init.argument.arguments[0].expression.value = `${declarations[0].init.argument.arguments[0].expression.value}?modules`;
    }

    return expression;
  }
}

export default AutoCSSModule;
