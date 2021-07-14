import { chalk, t, traverse } from '@umijs/utils';

export default function () {
  return {
    visitor: {
      CallExpression(path: traverse.NodePath<t.CallExpression>) {
        const { node } = path;
        if (
          t.isIdentifier(node.callee, {
            name: 'require',
          })
        ) {
          if (t.isStringLiteral(node.arguments[0])) {
            const val = node.arguments[0].value;
            // ./core/routes 在 .umi/umi.ts 里通过 hmr 使用，是正常的
            // @babel/runtime 在 .umi/dumi/demos/index.ts 里有使用
            if (val !== './core/routes' && !val.includes('@babel/runtime')) {
              console.warn(
                chalk.yellow(
                  // @ts-ignore
                  `[MFSU] require('${val}') found in ${path.hub.file.opts.filename}, which will broken the MFSU prebuild match, please change to esm module import.`,
                ),
              );
            }
          } else {
            console.warn(
              chalk.yellow(
                // @ts-ignore
                `[MFSU] require() syntax found in ${path.hub.file.opts.filename}, which will broken the MFSU prebuild match, please change to esm module import.`,
              ),
            );
          }
        }
      },
    },
  };
}
