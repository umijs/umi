import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { checkMatch } from './checkMatch';

export interface IOpts {
  onTransformDeps?: Function;
  onCollect?: Function;
  exportAllMembers?: Record<string, string[]>;
  unMatchLibs?: Array<string | RegExp>;
  remoteName?: string;
  alias?: Record<string, string>;
  externals?: any;
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
              if (isMatch) {
                node.source.value = replaceValue;
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
              });
              if (isMatch) {
                node.source.value = replaceValue;
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
                node.source.value = replaceValue;
              }
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
    },
  };
}
