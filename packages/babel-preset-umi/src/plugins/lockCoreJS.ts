import * as t from '@umijs/bundler-utils/compiled/babel/types';
import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import { winPath } from '@umijs/utils';
import { dirname } from 'path';

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export default function () {
  return {
    visitor: {
      CallExpression(path: Babel.NodePath<t.CallExpression>) {
        if (
          t.isImport(path.node.callee) &&
          t.isStringLiteral(path.node.arguments?.[0]) &&
          path.node.arguments[0].value.startsWith('core-js/')
        ) {
          path.node.arguments[0].value = path.node.arguments[0].value.replace(
            /^core-js\//,
            addLastSlash(
              winPath(dirname(require.resolve('core-js/package.json'))),
            ),
          );
        }
      },
    },
    post({ path }: { path: Babel.NodePath<t.Program> }) {
      path.node.body.forEach((node) => {
        if (t.isImportDeclaration(node)) {
          if (node.source.value.startsWith('core-js/')) {
            node.source.value = node.source.value.replace(
              /^core-js\//,
              addLastSlash(
                winPath(dirname(require.resolve('core-js/package.json'))),
              ),
            );
          }
        }
      });
    },
  };
}
