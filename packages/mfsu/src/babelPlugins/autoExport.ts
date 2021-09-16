import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export default function () {
  return {
    visitor: {
      Program(path: Babel.NodePath<t.Program>) {
        let hasExport = false;
        path.node.body.forEach((node) => {
          if (
            // esm
            t.isExportNamedDeclaration(node) ||
            t.isExportDefaultDeclaration(node) ||
            t.isExportAllDeclaration(node) ||
            // cjs
            (t.isExpressionStatement(node) &&
              t.isAssignmentExpression(node.expression) &&
              t.isMemberExpression(node.expression.left) &&
              // exports.xxx =
              (t.isIdentifier(node.expression.left.object, {
                name: 'exports',
              }) ||
                // module.exports =
                (t.isIdentifier(node.expression.left.object, {
                  name: 'module',
                }) &&
                  t.isIdentifier(node.expression.left.property, {
                    name: 'exports',
                  }))))
          ) {
            hasExport = true;
          }
        });

        if (!hasExport) {
          path.node.body.push(
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('__mfsu'),
                  t.numericLiteral(1),
                ),
              ]),
            ),
          );
        }
      },
    },
  };
}
