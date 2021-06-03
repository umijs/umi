// @ts-nocheck
import type { NodePath } from '@babel/traverse';
import { t } from '@umijs/utils';

export default function () {
  return {
    visitor: {
      ImportDeclaration: {
        exit(path: NodePath<t.Program>) {
          const { specifiers, source } = path.node;
          const { value } = source;
          if (!/^@ant-design\/icons\/./.test(value)) {
            return;
          }
          specifiers.forEach((spec) => {
            if (t.isImportDefaultSpecifier(spec)) {
              const iconName = value.split('/').slice(-1)[0];
              const importDeclaration = t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(iconName),
                    t.identifier(iconName),
                  ),
                ],
                t.stringLiteral('@ant-design/icons'),
              );
              path.insertAfter(importDeclaration);
            }
          });
          path.remove();
        },
      },
    },
  };
}
