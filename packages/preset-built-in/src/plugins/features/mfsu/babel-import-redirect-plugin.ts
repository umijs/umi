// @ts-nocheck
import type { NodePath } from '@babel/traverse';
import { lodash, t } from '@umijs/utils';

export interface IRedirect {
  [from: string]: {
    [name: string]: string;
  };
}

export default function () {
  return {
    visitor: {
      ImportDeclaration: {
        exit(
          path: NodePath<t.Program>,
          { opts: redirect }: { opts: IRedirect },
        ) {
          const { specifiers, source } = path.node;
          const { value } = source;
          if (!Object.keys(redirect).includes(value)) {
            return;
          }
          const rMap = redirect[value];

          const imports = specifiers
            .map((spec: any) => {
              if (t.isImportSpecifier(spec)) {
                return spec.imported.name;
              }
            })
            .filter(Boolean);

          if (
            !lodash.intersection(imports, Object.keys(redirect[value])).length
          ) {
            return;
          }

          specifiers.forEach((spec: any) => {
            if (t.isImportSpecifier(spec)) {
              const {
                imported: { name: importedName },
                local: { name: localName },
              } = spec;
              if (!rMap[importedName]) return;
              const importDeclaration = t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(localName),
                    t.identifier(importedName),
                  ),
                ],
                t.stringLiteral(rMap[importedName]),
              );
              path.insertAfter([importDeclaration]);
            }
          });

          const restImport = specifiers.filter((spec: any) => {
            if (t.isImportDefaultSpecifier(spec)) {
              return true;
            }
            if (t.isImportSpecifier(spec)) {
              if (rMap[spec.imported.name]) {
                return false;
              }
            }
            return true;
          });
          if (restImport.length) {
            path.replaceWith(
              t.importDeclaration(restImport, t.stringLiteral(value)),
            );
          } else {
            path.remove();
          }
        },
      },
    },
  };
}
