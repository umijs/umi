import { t } from '@umijs/utils';
import * as traverse from '@babel/traverse';

type TLibs = (RegExp | string)[];

interface IAlias {
  [key: string]: string;
}

export interface IOpts {
  libs: TLibs;
  remoteName: string;
  alias?: IAlias;
}

export function specifiersToProperties(specifiers: any[]) {
  return specifiers.reduce(
    (memo, s) => {
      if (t.isImportDefaultSpecifier(s)) {
        memo.properties.push(
          t.objectProperty(t.identifier('default'), s.local),
        );
      } else if (t.isExportDefaultSpecifier(s)) {
        memo.properties.push(
          t.objectProperty(t.identifier('default'), s.exported),
        );
      } else if (t.isExportSpecifier(s)) {
        memo.properties.push(t.objectProperty(s.local, s.exported));
      } else if (t.isImportNamespaceSpecifier(s)) {
        memo.namespaceIdentifier = s.local;
      } else {
        memo.properties.push(t.objectProperty(s.imported, s.local));
      }
      return memo;
    },
    { properties: [], namespaceIdentifier: null },
  );
}

function isValidLib(path: string, libs: TLibs, alias: IAlias) {
  return libs.concat(Object.keys(alias)).some((lib) => {
    if (typeof lib === 'string') {
      return lib === path;
    } else {
      return lib.test(path);
    }
  });
}

function getPath(path: string, alias: IAlias) {
  const keys = Object.keys(alias);
  for (const key of keys) {
    if (path.startsWith(key)) {
      return path.replace(key, alias[key]);
    }
  }
  return path;
}

export default function () {
  return {
    visitor: {
      Program: {
        exit(path: traverse.NodePath<t.Program>, { opts }: { opts: IOpts }) {
          const variableDeclarations = [];
          let index = path.node.body.length - 1;
          while (index >= 0) {
            const d = path.node.body[index];

            if (
              t.isImportDeclaration(d) &&
              isValidLib(d.source.value, opts.libs, opts.alias || {})
            ) {
              const {
                properties,
                namespaceIdentifier,
              } = specifiersToProperties(d.specifiers);
              const id = t.objectPattern(properties);
              const init = t.awaitExpression(
                t.callExpression(t.import(), [
                  t.stringLiteral(
                    `${opts.remoteName}/${getPath(
                      d.source.value,
                      opts.alias || {},
                    )}`,
                  ),
                ]),
              );
              if (namespaceIdentifier) {
                if (properties.length) {
                  variableDeclarations.unshift(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(id, namespaceIdentifier),
                    ]),
                  );
                }
                variableDeclarations.unshift(
                  t.variableDeclaration('const', [
                    t.variableDeclarator(namespaceIdentifier, init),
                  ]),
                );
              } else {
                variableDeclarations.unshift(
                  t.variableDeclaration('const', [
                    t.variableDeclarator(id, init),
                  ]),
                );
              }
              path.node.body.splice(index, 1);
            }

            // export { bar } from 'foo';
            if (
              t.isExportNamedDeclaration(d) &&
              d.source &&
              isValidLib(d.source.value, opts.libs, opts.alias || {})
            ) {
              const {
                properties,
                namespaceIdentifier,
              } = specifiersToProperties(d.specifiers);
              const id = t.objectPattern(properties);
              const init = t.awaitExpression(
                t.callExpression(t.import(), [
                  t.stringLiteral(
                    `${opts.remoteName}/${getPath(
                      d.source.value,
                      opts.alias || {},
                    )}`,
                  ),
                ]),
              );
              variableDeclarations.unshift(
                t.variableDeclaration('const', [
                  t.variableDeclarator(id, init),
                ]),
              );
              d.source = null;
            }

            index -= 1;
          }
          path.node.body = [...variableDeclarations, ...path.node.body];
        },
      },
    } as traverse.Visitor,
  };
}
