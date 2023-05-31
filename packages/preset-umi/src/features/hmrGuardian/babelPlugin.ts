import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { lodash } from '@umijs/utils';
import { extname, parse, relative, sep } from 'path';

export function defaultRenameVisitor() {
  return {
    visitor: {
      // @ts-ignore
      ExportDefaultDeclaration: {
        enter(path: any, state: any) {
          const def = path.node.declaration;
          const { cwd, filename } = state.file.opts;
          const relativePath = relative(cwd, filename);

          if (
            /^\.(tsx|jsx)$/.test(extname(relativePath)) &&
            // hidden relativePath
            !/(^|\/)\.[^\/.]/g.test(relativePath) &&
            !relativePath.includes('node_modules')
          ) {
            let componentName = path2Component(relativePath);
            if (!componentName) {
              return;
            }

            // solve identifier conflict
            const identifiers = Object.keys(path.scope.bindings || {});
            // add index if conflict
            let idx = 0;
            // loop util componentName conflict
            while (identifiers.includes(componentName)) {
              componentName = `${componentName}${idx}`;
              idx += 1;
            }

            // generate component name identifier
            const named = t.identifier(componentName);

            if (t.isArrowFunctionExpression(def)) {
              const varDec = t.variableDeclaration('const', [
                t.variableDeclarator(named, def),
              ]);
              const [varDeclPath] = path.insertBefore(varDec);
              path.scope.registerDeclaration(varDeclPath);
              path.replaceWith(t.exportDefaultDeclaration(named));
            } else if (t.isFunctionDeclaration(def) && !def.id) {
              def.id = named;
            }
          }
        },
      },
    },
  };
}

/**
 * convert path into componentName
 * like:
 *  - src/index.tsx => SrcIndex
 *  - components/Header.tsx => ComponentHeader
 *
 * @param filePath
 * @returns {string} componentName
 */
function path2Component(filePath: string): string {
  const { ext } = parse(filePath);
  return (
    filePath
      // remove extension
      .replace(ext, '')
      .split(sep)
      // upperFirst
      .map((item) => lodash.upperFirst(item.replace(/\W/g, '')))
      .join('')
  );
}
