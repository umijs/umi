import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.addBeforeBabelPresets(() => {
    return [
      {
        plugins: [
          () => {
            return {
              pre() {
                // @ts-ignore
                this.cache = new Map<string, any>();
              },
              post(state: any) {
                // @ts-ignore
                const { cache } = this;
                if (cache.has(state.opts.filename)) {
                  api.applyPlugins({
                    key: 'onCheckCode',
                    args: {
                      ...cache.get(state.opts.filename),
                      file: state.opts.filename,
                      isFromTmp: state.opts.filename.startsWith(
                        api.paths.absTmpPath,
                      ),
                    },
                  });
                }
              },
              visitor: {
                Program: {
                  enter(path: Babel.NodePath<t.Program>) {
                    // @ts-ignore
                    const file = path?.hub.file.opts.filename;
                    // @ts-ignore
                    const cache = this.cache;
                    // reset cache
                    cache.set(file, {});
                    path.node.body.forEach((node) => {
                      // import x from 'x'; { default: 'x' }
                      // import * as x2 from 'x'; { namespace: 'x2' }
                      // import x3, * as xx from 'x'; { default: 'x3', namespace: 'xx' }
                      // import { x4, a as b } from 'x'; { specifiers: { x4: 'x4', a: 'b' } }
                      if (t.isImportDeclaration(node)) {
                        const ret: Record<string, any> = {
                          value: node.source.value,
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
                            ] = specifier.local.name;
                          }
                        });
                        cache.get(file).imports ||= [];
                        cache.get(file).imports.push(ret);
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
          },
        ],
      },
    ];
  });
};
