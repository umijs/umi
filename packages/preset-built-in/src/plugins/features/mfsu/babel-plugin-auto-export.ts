import { t, traverse } from '@umijs/utils';

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
