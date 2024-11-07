import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { winPath } from '@umijs/utils';
import { join } from 'path';

function isModuleExports(node: t.Node): boolean {
  return (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: 'module' }) &&
    t.isIdentifier(node.property, { name: 'exports' })
  );
}

function isExportsMemberExpression(node: t.Node): boolean {
  return (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: 'exports' })
  );
}

export default function () {
  let opts: any;
  return {
    pre() {
      // @ts-ignore
      this.cache = new Map<string, any>();
    },
    post(state: any) {
      // @ts-ignore
      const { cache } = this;
      const filename = winPath(state.opts.filename);
      if (
        cache.has(filename) &&
        !filename.includes('bundler-webpack/client') &&
        !filename.startsWith(winPath(join(opts.cwd, 'node_modules')))
      ) {
        opts.onCheckCode({
          args: {
            ...cache.get(filename),
            file: filename,
            isFromTmp: filename.startsWith(opts.absTmpPath),
          },
        });
      }
    },
    visitor: {
      Program: {
        enter(path: Babel.NodePath<t.Program>, state: any) {
          opts = state.opts;
          // @ts-ignore
          const file = winPath(path?.hub.file.opts.filename);
          // @ts-ignore
          const cache = this.cache;
          // reset cache
          cache.set(file, {
            code: path.hub.getCode(),
            imports: [],
            cjsExports: [],
          });
          path.node.body.forEach((node) => {
            // import x from 'x'; { default: 'x' }
            // import * as x2 from 'x'; { namespace: 'x2' }
            // import x3, * as xx from 'x'; { default: 'x3', namespace: 'xx' }
            // import { x4, a as b } from 'x'; { specifiers: { x4: 'x4', a: 'b' } }
            if (t.isImportDeclaration(node)) {
              const ret: Record<string, any> = {
                source: node.source.value,
                loc: node.loc,
                kind: node.importKind,
              };
              node.specifiers.forEach((specifier) => {
                if (t.isImportDefaultSpecifier(specifier)) {
                  ret.default = specifier.local.name;
                } else if (t.isImportNamespaceSpecifier(specifier)) {
                  ret.namespace = specifier.local.name;
                } else if (t.isImportSpecifier(specifier)) {
                  ret.specifiers ||= {};
                  ret.specifiers[
                    t.isIdentifier(specifier.imported)
                      ? specifier.imported.name
                      : specifier.imported.value
                  ] = {
                    name: specifier.local.name,
                    kind: specifier.importKind,
                  };
                }
              });
              cache.get(file).imports.push(ret);
            }

            if (t.isExpressionStatement(node)) {
              const n = node as t.ExpressionStatement;
              // module.exports = x;
              if (
                t.isAssignmentExpression(n.expression) &&
                isModuleExports(n.expression.left)
              ) {
                cache.get(file).cjsExports.push('default');
              }
              // exports.x = x;
              if (
                t.isAssignmentExpression(n.expression) &&
                isExportsMemberExpression(n.expression.left)
              ) {
                cache.get(file).cjsExports.push(
                  // @ts-ignore
                  n.expression.left.property.name,
                );
              }
            }

            // TODO:
            // exports
            // callExpression
            // newExpression
          });
        },
      },
    },
  };
}
