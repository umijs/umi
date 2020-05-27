import { t } from '@umijs/utils';
import * as traverse from '@babel/traverse';

type TLibs = (RegExp | string)[];

export interface IOpts {
  libs: TLibs;
  remoteName: string;
}

export function specifiersToProperties(specifiers: any[]) {
  return specifiers.map((s) => {
    if (t.isImportDefaultSpecifier(s)) {
      return t.objectProperty(t.identifier('default'), s.local);
    } else {
      return t.objectProperty(s.imported, s.local);
    }
  });
}

function isValidLib(path: string, libs: TLibs) {
  return libs.some((lib) => {
    if (typeof lib === 'string') {
      return lib === path;
    } else {
      return lib.test(path);
    }
  });
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
              isValidLib(d.source.value, opts.libs)
            ) {
              const properties = specifiersToProperties(d.specifiers);
              variableDeclarations.unshift(
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.objectPattern(properties),
                    t.awaitExpression(
                      t.callExpression(t.import(), [
                        t.stringLiteral(`${opts.remoteName}/${d.source.value}`),
                      ]),
                    ),
                  ),
                ]),
              );
              path.node.body.splice(index, 1);
            }
            index -= 1;
          }
          path.node.body = [...variableDeclarations, ...path.node.body];
        },
      },
    } as traverse.Visitor,
  };
}
