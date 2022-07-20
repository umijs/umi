import { parse } from '@umijs/ast/dist/utils/parse';
import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { resolve } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import { dirname, isAbsolute } from 'path';
import { info } from './logger';
import { generate } from './utils/generate';

export function update(opts: {
  code: string;
  filePath: string;
  // for test
  routeCode?: string;
  updates?: {
    del?: string[];
    set?: Record<string, any>;
  };
  routesUpdates?: {
    del?: string[];
    handler?: Record<string, (current: any, node: any) => any>;
  };
}) {
  let extraRouteFile = null;
  const ast = parse(opts.code);
  traverse.default(ast, {
    Program: {
      enter(path: Babel.NodePath<t.Program>) {
        const n = findExportDefault(path.node, path, {
          defineConfig: 'defineConfig',
        });
        assert(t.isObjectExpression(n), `should be object expression`);

        // del
        const del = opts.updates?.del || [];
        del.forEach((key) => {
          info(`Delete config ${key}`);
          delProp(n, key);
        });

        // set
        const set = opts.updates?.set || {};
        Object.keys(set).forEach((key) => {
          info(`Set config ${key} to ${JSON.stringify(set[key])}`);
          setProp(n, key, set[key]);
        });

        // routes
        if (opts.routesUpdates) {
          const [routes] = findProp(n, 'routes') || [null];
          assert(routes, `routes is required in config`);
          let routesNode: any = null;
          if (t.isIdentifier(routes.value)) {
            const node = getIdentifierDeclaration(routes.value, path);
            if (t.isImportDeclaration(node)) {
              extraRouteFile = node.source.value;
            } else {
              routesNode = node;
            }
          } else if (t.isArrayExpression(routes.value)) {
            routesNode = routes.value;
          }
          if (routesNode) {
            assert(
              t.isArrayExpression(routesNode),
              `routes should be an array`,
            );
            transformRoutes(routesNode, opts.routesUpdates);
          }
        }
      },
    },
  });
  const code = generate(ast);
  const ret: {
    config: { filePath: string; code: string };
    routesConfig?: { filePath: string; code: string };
  } = {
    config: { filePath: opts.filePath, code },
  };

  if (extraRouteFile) {
    assert(isAbsolute(opts.filePath), `opts.filePath should be absolute`);
    let absRouteFile: string;
    let routeCode = opts.routeCode;
    if (!routeCode) {
      absRouteFile = resolve.sync(extraRouteFile, {
        basedir: dirname(opts.filePath),
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      });
      assert(existsSync(absRouteFile), `${absRouteFile} is not exists`);
      routeCode = readFileSync(absRouteFile, 'utf-8');
    }
    const ast = parse(routeCode!);
    traverse.default(ast, {
      Program: {
        enter(path: Babel.NodePath<t.Program>) {
          const n = findExportDefault(path.node, path, {});
          assert(t.isArrayExpression(n), `should be array expression`);
          transformRoutes(n, opts.routesUpdates);
        },
      },
    });
    ret.routesConfig = { filePath: absRouteFile!, code: generate(ast) };
  }

  return ret;
}

function transformRoutes(routes: t.ArrayExpression, updates: any) {
  for (const elem of routes.elements) {
    if (t.isSpreadElement(elem)) continue;
    assert(
      t.isObjectExpression(elem),
      `should be object expression, but got ${elem!.type}`,
    );
    transformRoute(elem);
  }
  function transformRoute(n: t.ObjectExpression) {
    const del: string[] = updates.del || [];
    del.forEach((key) => {
      info(`delete route prop ${key}`);
      delProp(n, key);
    });
    const handler = updates.handler || {};
    Object.keys(handler).forEach((key) => {
      const [p, index] = findProp(n, key) || [null, -1];
      if (!p || index === -1) return;
      handler[key](p, n);
    });
    const [routes] = findProp(n, 'routes') || [null];
    if (routes) {
      assert(t.isArrayExpression(routes.value), `should be array expression`);
      transformRoutes(routes.value, updates);
    }
  }
}

// foo
// foo.bar
// TODO: foo.[1]
function delProp(n: t.ObjectExpression, keys: string) {
  const [key, ...leftKeys] = keys.split('.');
  const [p, index] = findProp(n, key) || [null, -1];
  if (!p || index === -1) return;
  if (leftKeys.length === 0) {
    n.properties.splice(index, 1);
  } else {
    assert(t.isObjectExpression(p.value), `${key} is not an object`);
    delProp(p.value, leftKeys.join('.'));
  }
}

// foo: bar
// foo.bar: baz
function setProp(n: t.ObjectExpression, keys: string, value: any) {
  const [key, ...leftKeys] = keys.split('.');
  const [p] = findProp(n, key) || [];
  if (p) {
    if (leftKeys.length === 0) {
      p.value = t.valueToNode(value);
    } else {
      assert(t.isObjectExpression(p.value), `${key} is not an object`);
      setProp(p.value, leftKeys.join('.'), value);
    }
  } else {
    n.properties.push(
      t.objectProperty(
        t.identifier(key),
        buildValue(leftKeys.join('.'), value),
      ),
    );
  }
}

function buildValue(keys: string, value: any): any {
  const [key, ...leftKeys] = keys.split('.');
  if (!key) {
    return t.valueToNode(value);
  }
  if (leftKeys.length === 0) {
    return t.objectExpression([
      t.objectProperty(t.identifier(key), t.valueToNode(value)),
    ]);
  }
  return t.objectExpression([
    t.objectProperty(t.identifier(key), buildValue(leftKeys.join('.'), value)),
  ]);
}

function findProp(
  n: t.ObjectExpression,
  key: string,
): [t.ObjectProperty, number] | null {
  let index = 0;
  for (const p of n.properties) {
    if (t.isSpreadElement(p)) continue;
    if (t.isObjectMethod(p)) continue;
    if (t.isStringLiteral(p.key) && p.key.value === key) {
      return [p, index];
    }
    if (!t.isIdentifier(p.key)) continue;
    if (p.key.name === key) {
      return [p, index];
    }
    index += 1;
  }
  return null;
}

function findExportDefault(
  programNode: t.Program,
  path: Babel.NodePath,
  opts: {
    defineConfig?: string;
  } = {},
) {
  let node = null;
  for (const n of programNode.body) {
    if (t.isExportDefaultDeclaration(n)) {
      node = n.declaration;
    }
  }
  assert(node, `should have export default`);
  if (opts.defineConfig) {
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee, {
        name: opts.defineConfig,
      })
    ) {
      node = node.arguments[0];
    }
  }
  node = getIdentifierDeclaration(node, path);
  return node;
}

export function getIdentifierDeclaration(node: t.Node, path: Babel.NodePath) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    const bindingPath = path.scope.getBinding(node.name)!.path;
    let bindingNode = bindingPath.node;
    if (
      (t.isImportDefaultSpecifier(bindingNode) ||
        t.isImportSpecifier(bindingNode)) &&
      bindingPath.parentPath
    ) {
      bindingNode = bindingPath.parentPath.node;
    }
    if (t.isVariableDeclarator(bindingNode)) {
      assert(bindingNode.init, `should have init`);
      bindingNode = bindingNode.init;
    }
    return bindingNode;
  }
  return node;
}
