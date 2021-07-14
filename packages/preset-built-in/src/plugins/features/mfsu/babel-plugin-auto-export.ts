import { t, traverse } from '@umijs/utils';

export default function () {
  return {
    visitor: {
      Program(path: traverse.NodePath<t.Program>) {
        let hasExport = false;
        path.node.body.forEach((node) => {
          if (
            t.isExportNamedDeclaration(node) ||
            t.isExportDefaultDeclaration(node) ||
            t.isExportAllDeclaration(node)
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
