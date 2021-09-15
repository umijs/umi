import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { checkMatch } from './checkMatch';
import { parseSpecifiers } from './parseSpecifiers';

export interface IOpts {
  onTransformDeps?: Function;
  onCollect?: Function;
  exportAllMembers?: Record<string, string[]>;
  unMatchLibs?: string[];
  remoteName?: string;
  alias?: Record<string, string>;
  externals?: any;
}

function isCSS(val: string) {
  return /\.(css|less|sass|scss|stylus|styl)(\?.+?)?$/.test(val);
}

export default function () {
  return {
    pre() {
      // @ts-ignore
      this.cache = new Map<string, any>();
    },
    post(state: any) {
      // @ts-ignore
      const { cache } = this;
      if (cache.has(state.opts.filename)) {
        // @ts-ignore
        this.opts.onCollect?.({
          file: state.opts.filename,
          data: cache.get(state.opts.filename),
        });
      }
    },
    visitor: {
      Program: {
        exit(path: Babel.NodePath<t.Program>, { opts }: { opts: IOpts }) {
          const topDeclarations = [];
          const bottomDeclarations = [];
          let index = path.node.body.length - 1;
          while (index >= 0) {
            const node = path.node.body[index];

            // import x from 'x';
            // import * as x from 'x';
            // import x, * as xx from 'x';
            // import { x } from 'x';
            if (t.isImportDeclaration(node)) {
              const { isMatch, replaceValue } = checkMatch({
                // @ts-ignore
                cache: this.cache,
                value: node.source.value,
                opts,
                path,
              });
              if (isMatch || isCSS(node.source.value)) {
                path.node.body.splice(index, 1);
                const { properties, namespaceIdentifier } = parseSpecifiers(
                  node.specifiers,
                );
                const id = t.objectPattern(properties);
                const init = t.awaitExpression(
                  t.callExpression(t.import(), [
                    t.stringLiteral(isMatch ? replaceValue : node.source.value),
                  ]),
                );
                if (namespaceIdentifier) {
                  topDeclarations.unshift(
                    t.variableDeclaration(
                      'const',
                      [
                        t.variableDeclarator(namespaceIdentifier, init),
                        properties.length &&
                          t.variableDeclarator(id, namespaceIdentifier),
                      ].filter(Boolean),
                    ),
                  );
                } else {
                  topDeclarations.unshift(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(id, init),
                    ]),
                  );
                }
              }
            }

            // export * from 'x';
            else if (t.isExportAllDeclaration(node)) {
              const { isMatch, replaceValue } = checkMatch({
                // @ts-ignore
                cache: this.cache,
                value: node.source.value,
                opts,
                path,
                isExportAll: true,
              });
              if (isMatch) {
                const members =
                  opts.exportAllMembers?.[node.source.value] || [];
                if (members.length) {
                  const id = t.identifier(
                    `__all_exports_${node.source.value.replace(
                      /([@\/\-])/g,
                      '_',
                    )}`,
                  );
                  const init = t.awaitExpression(
                    t.callExpression(t.import(), [
                      t.stringLiteral(replaceValue),
                    ]),
                  );
                  topDeclarations.unshift(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(id, init),
                    ]),
                  );
                  // replace node with export const { a, b, c } = __all_exports
                  // a, b, c was declared from opts.exportAllMembers
                  path.node.body[index] = t.exportNamedDeclaration(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.objectPattern(
                          members.map((m) =>
                            t.objectProperty(t.identifier(m), t.identifier(m)),
                          ),
                        ),
                        id,
                      ),
                    ]),
                  );
                }
                // 有些 export * 只是为了类型
                else {
                  path.node.body[index] = t.expressionStatement(
                    t.numericLiteral(1),
                  );
                }
              }
            }

            // export { x } from 'x';
            else if (t.isExportNamedDeclaration(node) && node.source) {
              const { isMatch, replaceValue } = checkMatch({
                // @ts-ignore
                cache: this.cache,
                value: node.source.value,
                opts,
                path,
              });
              if (isMatch) {
                const { properties, defaultIdentifier } = parseSpecifiers(
                  node.specifiers,
                );
                const id = t.objectPattern(properties);
                const init = t.awaitExpression(
                  t.callExpression(t.import(), [t.stringLiteral(replaceValue)]),
                );
                topDeclarations.unshift(
                  t.variableDeclaration('const', [
                    t.variableDeclarator(id, init),
                  ]),
                );
                node.source = null;
                node.specifiers = node.specifiers.filter((specifier: any) => {
                  if (
                    t.isExportSpecifier(specifier) &&
                    t.isIdentifier(specifier.local) &&
                    t.isIdentifier(specifier.exported)
                  ) {
                    specifier.local = specifier.exported;
                  }
                  return !(
                    t.isExportSpecifier(specifier) &&
                    t.isIdentifier(specifier.exported) &&
                    specifier.exported.name === 'default'
                  );
                });
                if (!node.specifiers.length) {
                  path.node.body.splice(index, 1);
                }
                if (defaultIdentifier) {
                  bottomDeclarations.push(
                    t.exportDefaultDeclaration(t.identifier(defaultIdentifier)),
                  );
                }
              }
            }

            index -= 1;
          }

          path.node.body = [
            ...topDeclarations,
            ...path.node.body,
            ...bottomDeclarations,
          ];
        },
      },
      CallExpression(
        path: Babel.NodePath<t.CallExpression>,
        { opts }: { opts: IOpts },
      ) {
        const { node } = path;
        if (
          t.isImport(node.callee) &&
          node.arguments.length === 1 &&
          node.arguments[0].type === 'StringLiteral'
        ) {
          const { isMatch, replaceValue } = checkMatch({
            // @ts-ignore
            cache: this.cache,
            value: node.arguments[0].value,
            opts,
            path,
          });
          if (isMatch) {
            node.arguments[0] = t.stringLiteral(replaceValue);
          }
        }
      },
    },
  };
}
