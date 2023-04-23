import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export interface IOpts {
  resolveImportSource: (importSource: string) => string;
  exportAllMembers?: Record<string, string[]>;
  unMatchLibs?: string[];
  remoteName?: string;
  alias?: Record<string, string>;
  externals?: any;
}

export default function () {
  return {
    visitor: {
      Program: {
        exit(path: Babel.NodePath<t.Program>, { opts }: { opts: IOpts }) {
          let index = path.node.body.length - 1;
          while (index >= 0) {
            const node = path.node.body[index];

            // import x from 'x';
            // import * as x from 'x';
            // import x, * as xx from 'x';
            // import { x } from 'x';

            if (t.isImportDeclaration(node)) {
              node.source.value = opts.resolveImportSource(node.source.value);
            }

            // export * from 'x';
            else if (t.isExportAllDeclaration(node)) {
              node.source.value = opts.resolveImportSource(node.source.value);
            }

            // export { x } from 'x';
            else if (t.isExportNamedDeclaration(node) && node.source) {
              node.source.value = opts.resolveImportSource(node.source.value);
            }

            index -= 1;
          }
        },
      },
      CallExpression: {
        exit(
          path: Babel.NodePath<t.CallExpression>,
          { opts }: { opts: IOpts },
        ) {
          const { node } = path;
          if (
            t.isImport(node.callee) &&
            node.arguments.length === 1 &&
            t.isStringLiteral(node.arguments[0])
          ) {
            const newValue = opts.resolveImportSource(node.arguments[0].value);
            node.arguments[0].value = newValue;
          }
        },
      },
    },
  };
}
