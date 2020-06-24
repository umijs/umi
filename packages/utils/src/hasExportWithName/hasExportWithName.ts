import { readFileSync } from 'fs';
import { t, parser } from '..';
import { extname } from 'path';

export function hasExportWithName(opts: {
  name: string;
  filePath: string;
}) {
  const content = readFileSync(opts.filePath, 'utf-8');
  const isTS = extname(opts.filePath) === '.ts';
  const isTSX = extname(opts.filePath) === '.tsx';

  // @ts-ignore
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: [
      // .ts 不能加 jsx，因为里面可能有 `<Type>{}` 这种写法
      // .tsx, .js, .jsx 可以加
      isTS ? false : 'jsx',
      // 非 ts 不解析 typescript
      isTS || isTSX ? 'typescript' : false,
      // 支持更多语法
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy',
    ].filter(Boolean) as parser.ParserPlugin[],
  });

  let hasExport = false;
  ast.program.body.forEach(node => {
    if (t.isExportNamedDeclaration(node)) {
      if (node.declaration) {
        // export function xxx(){};
        if (t.isFunctionDeclaration(node.declaration)) {
          const id = node.declaration.id;
          if (t.isIdentifier(id) && id.name === opts.name) {
            hasExport = true;
          }
        }

        // export const xxx = () => {};
        if (
          t.isVariableDeclaration(node.declaration) &&
          node.declaration.declarations
        ) {
          if (
            node.declaration.declarations.some(declaration => {
              return (
                t.isVariableDeclarator(declaration) &&
                t.isIdentifier(declaration.id) &&
                declaration.id.name === opts.name
              );
            })
          ) {
            hasExport = true;
          }
        }
      }

      // export { getInitialState };
      if (
        node.specifiers &&
        node.specifiers.some(specifier => specifier.exported.name === opts.name)
      ) {
        hasExport = true;
      }
    }
  });

  return hasExport;
};
