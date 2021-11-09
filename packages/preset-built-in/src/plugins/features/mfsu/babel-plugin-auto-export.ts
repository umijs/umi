import { t, traverse } from '@umijs/utils';

function expressionHasCjsExports(node: t.Expression | null): boolean {
  if (node && t.isAssignmentExpression(node)) {
    if (
      t.isMemberExpression(node.left) &&
      (t.isIdentifier(node.left.object, {
        name: 'exports',
      }) ||
        // module.exports =
        (t.isIdentifier(node.left.object, {
          name: 'module',
        }) &&
          t.isIdentifier(node.left.property, {
            name: 'exports',
          })))
    ) {
      return true;
    } else if (t.isIdentifier(node.left)) {
      return expressionHasCjsExports(node.right);
    }
  }
  return false;
}

function variableHasCJSExports(node: t.Statement) {
  return (
    t.isVariableDeclaration(node) &&
    node.declarations.some((declarator) =>
      expressionHasCjsExports(declarator.init),
    )
  );
}

export default function () {
  return {
    visitor: {
      Program(path: traverse.NodePath<t.Program>) {
        let hasExport = false;
        path.node.body.forEach((node) => {
          if (
            // esm
            t.isExportNamedDeclaration(node) ||
            t.isExportDefaultDeclaration(node) ||
            t.isExportAllDeclaration(node) ||
            // cjs
            (t.isExpressionStatement(node) &&
              expressionHasCjsExports(node.expression)) ||
            variableHasCJSExports(node)
          ) {
            hasExport = true;
          }
        });

        if (!hasExport) {
          // console.warn(
          //   chalk.yellow(
          //     // @ts-ignore
          //     `[MFSU] no export found in ${path.hub.file.opts.filename}.`,
          //   ),
          // );
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
