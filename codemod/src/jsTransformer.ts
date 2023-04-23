import { generate } from '@umijs/ast/dist/utils/generate';
import { parse } from '@umijs/ast/dist/utils/parse';
import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { lodash } from '@umijs/utils';
import { getIdentifierDeclaration } from './configUpdater';
import { ROUTE_PROPS, ROUTE_PROPS_MAP } from './constants';
import { info, warn } from './logger';
import { Context } from './types';

function buildHooks(name: string): any[] {
  switch (name) {
    case 'history':
      return [];
    case 'location':
    case 'match':
    case 'params':
      return [buildHooksVD(name, ROUTE_PROPS_MAP[name])];
    case 'route':
    case 'routes':
      return [buildHooksVD(name, ROUTE_PROPS_MAP[name], true)];
    default:
      throw new Error(`Unsupported hook name ${name}`);
  }
}

function buildHooksVD(
  varName: string,
  hookName: string,
  isObjectPattern?: boolean,
) {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      isObjectPattern
        ? t.objectPattern([
            t.objectProperty(
              t.identifier(varName),
              t.identifier(varName),
              false,
              true,
            ),
          ])
        : t.identifier(varName),
      t.callExpression(t.identifier(hookName), []),
    ),
  ]);
}

export function transform(opts: {
  code: string;
  filePath: string;
  context?: Context;
}) {
  const importRenames = [
    (source: string) => {
      if (source === '@@/plugin-qiankun/masterOptions') {
        info(
          `Import from @@/plugin-qiankun/masterOptions to @@/plugin-qiankun-master/masterOptions`,
        );
        return '@@/plugin-qiankun-master/masterOptions';
      } else if (source === '@@/plugin-model/useModel') {
        return 'umi';
      } else {
        return source;
      }
    },
  ];
  const importAdds: {
    source: string;
    specifiers: Specifier[];
  }[] = [];
  // 注释的原因是：没有办法判断是引用的子路由，只有这种场景的 children 需要改成 Outlet
  // if (opts.code.includes('children') || opts.code.includes('props.children')) {
  //   importAdds.push({
  //     source: '@alipay/bigfish',
  //     specifiers: [{ imported: 'Outlet' }],
  //   });
  // }
  const specifierSourceRenames: any[] = [];
  const specifierSourceDeleted: {
    source: string;
    specifier: string;
  }[] = [];
  const specifierRenames = [
    {
      source: 'umi',
      specifier: 'useRouteMatch',
      newSpecifier: 'useMatch',
    },
    {
      source: 'umi',
      specifier: 'Redirect',
      newSpecifier: 'Navigate',
    },
  ];

  const ast = parse(opts.code);
  const originAST = lodash.cloneDeep(ast);
  let hasDynamic = false;
  let hasChildrenExpression = false;
  let hasHistoryPushQuery = false;
  let hasInvalidMatchPathCall = false;
  let routePropsDetected: Set<string> = new Set([]);
  let hasLocationQueryAssign = false;
  const routePropsMap: Map<Babel.NodePath, Set<string>> = new Map();

  traverse.default(ast, {
    CallExpression(path: Babel.NodePath<t.CallExpression>) {
      const { callee } = path.node;
      // dynamic()
      if (t.isIdentifier(callee, { name: 'dynamic' })) {
        const bindingNode = getIdentifierDeclaration(path.node.callee, path);
        if (
          t.isImportDeclaration(bindingNode) &&
          bindingNode.source.value === 'umi'
        ) {
          const args = path.node.arguments;
          if (args[0] && t.isObjectExpression(args[0])) {
            const loader = getPropertyValue(args[0], 'loader');
            if (loader) {
              (path.node.callee as t.Identifier).name = 'loadable';
              path.node.arguments[0] = t.arrowFunctionExpression([], loader);
              hasDynamic = true;
            }
          }
        }
      }

      // invalid matchPath call
      if (
        t.isIdentifier(callee, { name: 'matchPath' }) ||
        (t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property, {
            name: 'matchPath',
          }))
      ) {
        const firstArg = getIdentifierDeclaration(path.node.arguments[0], path);
        if (!t.isObjectExpression(firstArg)) {
          hasInvalidMatchPathCall = true;
        }
      }

      // history.push query > search
      if (t.isMemberExpression(callee)) {
        if (
          t.isIdentifier(callee.object, { name: 'history' }) &&
          t.isIdentifier(callee.property, { name: 'push' })
        ) {
          const args = path.node.arguments;
          if (t.isObjectExpression(args[0])) {
            const obj = args[0];
            obj.properties.forEach((p) => {
              if (!t.isObjectProperty(p)) return;
              if (
                t.isIdentifier(p.key, { name: 'query' }) &&
                t.isObjectExpression(p.value)
              ) {
                info(`Change history.push query to search`);
                p.key.name = 'search';
                p.value = t.callExpression(
                  t.memberExpression(
                    t.identifier('qs'),
                    t.identifier('stringify'),
                  ),
                  [p.value],
                );
                hasHistoryPushQuery = true;
              }
            });
          }
        }
      }
    },
    JSXExpressionContainer(path: Babel.NodePath<t.JSXExpressionContainer>) {
      const { expression } = path.node;
      // { props.children }
      if (
        t.isMemberExpression(expression) &&
        t.isIdentifier(expression.object, { name: 'props' }) &&
        t.isIdentifier(expression.property, { name: 'children' })
      ) {
        hasChildrenExpression = true;
      }
      // { children }
      if (t.isIdentifier(expression, { name: 'children' })) {
        hasChildrenExpression = true;
      }
    },
    MemberExpression(path: Babel.NodePath<t.MemberExpression>) {
      // history.goBack > history.back
      if (
        t.isIdentifier(path.node.object, { name: 'history' }) &&
        t.isIdentifier(path.node.property, { name: 'goBack' })
      ) {
        path.node.property.name = 'back';
        info(`Change history.goBack to history.back`);
      }

      // route props
      if (
        t.isIdentifier(path.node.object, { name: 'props' }) &&
        t.isIdentifier(path.node.property) &&
        ROUTE_PROPS.has(path.node.property.name)
      ) {
        const name = path.node.property.name;
        const propsPath = getBindingPath('props', path);
        if (
          propsPath.parentPath &&
          (t.isArrowFunctionExpression(propsPath.parentPath.node) ||
            t.isFunctionDeclaration(propsPath.parentPath.node) ||
            t.isFunctionExpression(propsPath.parentPath.node)) &&
          t.isBlockStatement(propsPath.parentPath.node.body)
        ) {
          const pp = propsPath.parentPath;
          if (!routePropsMap.has(pp)) {
            routePropsMap.set(pp, new Set<string>([]));
          }
          if (!routePropsMap.get(pp)!.has(name)) {
            routePropsMap.get(pp)!.add(name);
            propsPath.parentPath.node.body.body.unshift(...buildHooks(name));
            if (name !== 'history') {
              info(`Add hooks import for ${name}`);
            }
          }
        }
        path.replaceWith(t.identifier(name));
        info(`Change props.${name} to ${name}`);
        routePropsDetected.add(name);
      }
    },
    VariableDeclarator(path: Babel.NodePath<t.VariableDeclarator>) {
      const { id, init } = path.node;
      // const { query } = location;
      if (t.isIdentifier(init, { name: 'location' }) && t.isObjectPattern(id)) {
        let index = id.properties.length - 1;
        while (index >= 0) {
          const p = id.properties[index];
          if (
            t.isObjectProperty(p) &&
            t.isIdentifier(p.key, { name: 'query' })
          ) {
            hasLocationQueryAssign = true;
            path.parentPath.insertAfter(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('query'),
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('qs_l_q'),
                      t.identifier('parse'),
                    ),
                    [
                      t.memberExpression(
                        t.identifier('location'),
                        t.identifier('search'),
                      ),
                    ],
                  ),
                ),
              ]),
            );
            id.properties.splice(index, 1);
            if (id.properties.length === 0) {
              path.parentPath.remove();
            }
            info(
              `Change const { query } = location to const query = qs.parse(location.search)`,
            );
          }
          index -= 1;
        }
      }
      // route props
      if (t.isIdentifier(init, { name: 'props' }) && t.isObjectPattern(id)) {
        let index = id.properties.length - 1;
        while (index >= 0) {
          const p = id.properties[index];
          if (
            t.isObjectProperty(p) &&
            t.isIdentifier(p.key) &&
            ROUTE_PROPS.has(p.key.name)
          ) {
            const name = p.key.name;
            const propsPath = getBindingPath('props', path);
            if (
              propsPath.parentPath &&
              (t.isArrowFunctionExpression(propsPath.parentPath.node) ||
                t.isFunctionDeclaration(propsPath.parentPath.node) ||
                t.isFunctionExpression(propsPath.parentPath.node)) &&
              t.isBlockStatement(propsPath.parentPath.node.body)
            ) {
              const pp = propsPath.parentPath;
              if (!routePropsMap.has(pp)) {
                routePropsMap.set(pp, new Set<string>([]));
              }
              if (!routePropsMap.get(pp)!.has(name)) {
                routePropsMap.get(pp)!.add(name);
                propsPath.parentPath.node.body.body.unshift(
                  ...buildHooks(name),
                );
              }
            }
            routePropsDetected.add(name);
            id.properties.splice(index, 1);
            if (id.properties.length === 0) {
              path.remove();
            }
          }
          index -= 1;
        }
      }
    },
  });

  if (hasDynamic) {
    importAdds.push({
      source: '@loadable/component',
      specifiers: [
        {
          type: 'ImportDefaultSpecifier',
          local: 'loadable',
        },
      ],
    });
    specifierSourceDeleted.push({
      source: 'umi',
      specifier: 'dynamic',
    });
  }
  if (hasHistoryPushQuery) {
    importAdds.push({
      source: 'query-string',
      specifiers: [
        {
          type: 'ImportNamespaceSpecifier',
          local: 'qs',
        },
      ],
    });
    opts.context!.deps.includes['query-string'] = '^7';
  }
  if (hasChildrenExpression) {
    warn(
      `检测到 props.children 或 children，如果是用于嵌套子路由，请改用 <Outlet>`,
    );
  }
  if (hasInvalidMatchPathCall) {
    warn(`检测到不兼容的 matchPath 的使用，请参考升级文档进行修改`);
  }
  if (routePropsDetected.size) {
    // warn(
    //   `检测到使用了不兼容的 route 的 props：${Array.from(
    //     routePropsDetected,
    //   ).join(', ')}，请参考升级文档进行修改`,
    // );
    importAdds.push({
      source: 'umi',
      specifiers: Array.from(routePropsDetected).map((name) => ({
        type: 'ImportSpecifier',
        // @ts-ignore
        imported: ROUTE_PROPS_MAP[name],
      })),
    });
  }
  if (hasLocationQueryAssign) {
    importAdds.push({
      source: 'query-string',
      specifiers: [
        {
          type: 'ImportNamespaceSpecifier',
          local: 'qs_l_q',
        },
      ],
    });
    opts.context!.deps.includes['query-string'] = '^7';
  }

  traverse.default(ast, {
    Program: {
      enter(path: Babel.NodePath<t.Program>) {
        for (const [nIndex, n] of path.node.body.entries()) {
          if (t.isImportDeclaration(n)) {
            const source = n.source.value;

            // import * as styles from './index.module.less';
            // to
            // import styles from './index.module.less';
            if (
              n.specifiers.length === 1 &&
              t.isImportNamespaceSpecifier(n.specifiers[0]) &&
              (source.includes('.module.less') ||
                source.includes('.module.css'))
            ) {
              n.specifiers[0] = t.importDefaultSpecifier(n.specifiers[0].local);
            }

            // rename source
            n.source.value = importRenames.reduce(
              (source, fn) => fn(source),
              source,
            );

            // specifierRenames
            for (const {
              source,
              specifier,
              newSpecifier,
            } of specifierRenames) {
              if (n.source.value === source) {
                for (const s of n.specifiers) {
                  if (
                    t.isImportDefaultSpecifier(s) ||
                    t.isImportNamespaceSpecifier(s)
                  )
                    continue;
                  if (
                    t.isIdentifier(s.imported, {
                      name: specifier,
                    })
                  ) {
                    info(
                      `Import ${specifier} -> ${newSpecifier} from ${source}`,
                    );
                    s.imported.name = newSpecifier;
                  }
                }
              }
            }

            let specifierDeleted = false;

            // import specifier rename
            for (const {
              source,
              newSource,
              specifier,
            } of specifierSourceRenames) {
              if (n.source.value === source) {
                for (const [index, s] of n.specifiers.entries()) {
                  if (
                    t.isImportDefaultSpecifier(s) ||
                    t.isImportNamespaceSpecifier(s)
                  )
                    continue;
                  if (
                    t.isIdentifier(s.imported, {
                      name: specifier,
                    })
                  ) {
                    importAdds.push({
                      source: newSource,
                      specifiers: [
                        {
                          type: 'ImportSpecifier',
                          imported: specifier,
                          local: s.local ? s.local.name : specifier,
                        },
                      ],
                    });
                    n.specifiers.splice(index, 1);
                    specifierDeleted = true;
                    info(
                      `Import rename ${specifier} from ${source} to ${newSource}`,
                    );
                  }
                }
              }
            }

            // import specifier delete
            for (const { source, specifier } of specifierSourceDeleted) {
              if (n.source.value === source) {
                for (const [index, s] of n.specifiers.entries()) {
                  if (
                    t.isImportDefaultSpecifier(s) ||
                    t.isImportNamespaceSpecifier(s)
                  )
                    continue;
                  if (
                    t.isIdentifier(s.imported, {
                      name: specifier,
                    })
                  ) {
                    info(`Import delete ${specifier} from ${source}`);
                    n.specifiers.splice(index, 1);
                    specifierDeleted = true;
                  }
                }
              }
            }

            // // @alipay/bigfish/icons > @ant-design/icons & assets
            // if (n.source.value === '@alipay/bigfish/icons') {
            //   let index = n.specifiers.length - 1;
            //   while (index >= 0) {
            //     const s = n.specifiers[index];
            //     if (
            //       t.isImportDefaultSpecifier(s) ||
            //       t.isImportNamespaceSpecifier(s)
            //     )
            //       continue;
            //     if (t.isIdentifier(s.imported)) {
            //       if (ANTD_ICONS.has(s.imported.name)) {
            //         // antd
            //         n.source.value = '@ant-design/icons';
            //         info(
            //           `Change import from @alipay/bigfish/icons to @ant-design/icons`,
            //         );
            //         if (
            //           opts.context &&
            //           opts.context.deps?.includes &&
            //           !opts.context.hasAntdIconsInstalled
            //         ) {
            //           opts.context.deps.includes['@ant-design/icons'] =
            //             '^4.0.0';
            //         }
            //       } else {
            //         // assets
            //         info(`Import delete ${s.imported.name} from ${source}`);
            //         n.specifiers.splice(index, 1);
            //         specifierDeleted = true;
            //         const newSource = `@/assets/${s.imported.name}`;
            //         const importDeclaration = t.importDeclaration(
            //           [
            //             t.importSpecifier(
            //               t.identifier(s.local.name),
            //               t.identifier('ReactComponent'),
            //             ),
            //           ],
            //           t.stringLiteral(newSource),
            //         );
            //         info(
            //           `Import add ${s.local.name} as ReactComponent from ${newSource}`,
            //         );
            //         path.node.body.push(importDeclaration);
            //       }
            //     }
            //     index -= 1;
            //   }
            // }

            if (specifierDeleted && n.specifiers.length === 0) {
              path.node.body.splice(nIndex, 1);
            }
          }
        }

        // import adds
        importAdds.forEach(({ source, specifiers }) => {
          const importDeclaration = t.importDeclaration(
            specifiers.map((s) => buildSpecifier(s)),
            t.stringLiteral(source),
          );
          info(`Import add ${JSON.stringify(specifiers)} from ${source}`);
          path.node.body.push(importDeclaration);
        });
      },
    },

    // JSXExpressionContainer(path: Babel.NodePath<t.JSXExpressionContainer>) {
    //   // children | props.children > <Outlet />
    //   const { expression } = path.node;
    //   if (
    //     t.isIdentifier(expression, { name: 'children' }) ||
    //     (t.isMemberExpression(expression) &&
    //       t.isIdentifier(expression.object, { name: 'props' }) &&
    //       t.isIdentifier(expression.property, { name: 'children' }))
    //   ) {
    //     path.replaceWith(
    //       t.jsxElement(
    //         t.jsxOpeningElement(t.jsxIdentifier('Outlet'), [], true),
    //         null,
    //         [],
    //         true,
    //       ),
    //     );
    //   }
    // },
  });

  // 不修改没有改过的文件
  if (lodash.isEqual(ast, originAST)) {
    return { code: null, skip: true };
  }

  const code = generate(ast);
  return { code, skip: false };
}

function getPropertyValue(obj: t.ObjectExpression, propertyName: string): any {
  for (const p of obj.properties) {
    if (
      t.isObjectProperty(p) &&
      t.isIdentifier(p.key, { name: propertyName })
    ) {
      return p.value;
    }
  }
  return null;
}

type Specifier = {
  type:
    | 'ImportNamespaceSpecifier'
    | 'ImportDefaultSpecifier'
    | 'ImportSpecifier';
  imported?: string;
  local?: string;
};

function buildSpecifier(s: Specifier) {
  switch (s.type) {
    case 'ImportDefaultSpecifier':
      return t.importDefaultSpecifier(t.identifier(s.local!));
    case 'ImportNamespaceSpecifier':
      return t.importNamespaceSpecifier(t.identifier(s.local!));
    case 'ImportSpecifier':
      return t.importSpecifier(
        t.identifier(s.local || s.imported!),
        t.identifier(s.imported!),
      );
    default:
      throw new Error(`Unsupported specifier type ${s.type}`);
  }
}

export function getBindingPath(name: string, path: Babel.NodePath) {
  if (path.scope.hasBinding(name)) {
    return path.scope.getBinding(name)!.path;
  }
  return path;
}
