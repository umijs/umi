import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export default (): Babel.PluginObj => {
  return {
    visitor: {
      Program: {
        enter(path, { opts }: any) {
          const expressions = path.get('body');
          const exports = opts?.exports || [];
          expressions.forEach((exp) => {
            if (
              !(
                t.isExportNamedDeclaration(exp) ||
                t.isExportDefaultDeclaration(exp)
              )
            )
              return;

            handleExportsIndividual(exp as any);
            handleExportsList(exp as any);
            handleExportsDefault(exp as any);
          });

          function handleExportsIndividual(
            path: Babel.NodePath<t.ExportNamedDeclaration>,
          ) {
            if (!path.node) return;
            if (!t.isExportNamedDeclaration(path)) return;
            if (!path.get('declaration').node) return;
            const declaration = path.get('declaration');
            if (t.isVariableDeclaration(declaration)) {
              const variables = declaration.get('declarations') as any[];
              variables.forEach((variable) => {
                exports.includes(variable.get('id.name').node) &&
                  variable.remove();
              });
            } else {
              exports.includes((declaration.get('id.name') as any).node) &&
                declaration.remove();
            }
          }

          function handleExportsList(
            path: Babel.NodePath<t.ExportNamedDeclaration>,
          ) {
            if (!path.node) return;
            if (!t.isExportNamedDeclaration(path)) return;

            const specifiers = path.get('specifiers');
            if (!specifiers || specifiers.length === 0) return;

            specifiers.forEach((specifier) => {
              if (
                exports.includes((specifier.get('exported.name') as any).node)
              )
                specifier.remove();
            });
            if (path.get('specifiers').length === 0) path.remove();
          }

          function handleExportsDefault(
            path: Babel.NodePath<t.ExportDefaultDeclaration>,
          ) {
            if (!path.node) return;
            if (!t.isExportDefaultDeclaration(path)) return;
            const declaration = path.get('declaration');
            if (!declaration.node) return;
            if (exports.includes((declaration.get('name') as any).node))
              declaration.remove();
          }
        },
        exit(path) {
          // Manually reprocess the scope to ensure that the removed declarations are updated.
          path.scope.crawl();

          const expressions = path.get('body');

          expressions.forEach((exp) => {
            if (!t.isImportDeclaration(exp)) return;

            const specifiers = exp.get('specifiers') as any[];
            specifiers.forEach((s) => {
              const name = s.get('local.name').node;
              if (!s.scope.getBinding(name).referenced) s.remove();
            });
            if ((exp.get('specifiers') as any[]).length === 0) exp.remove();
          });
        },
      },
    },
  };
};
