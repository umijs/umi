import { generate } from '@umijs/ast/dist/utils/generate';
import { parse } from '@umijs/ast/dist/utils/parse';
import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import assert from 'assert';

export function update(opts: {
  code: string;
  filePath: string;
  updates?: {
    set?: Partial<Record<string, Record<string, any>>>;
  };
}): { code: string } {
  const set = opts.updates?.set;
  if (!set) return { code: opts.code };
  const keys = Object.keys(set);
  const ast = parse(opts.code);
  traverse.default(ast, {
    Program: {
      exit(path: Babel.NodePath<t.Program>) {
        const { node } = path;
        keys.forEach((key) => {
          if (!set[key]) return;
          node.body.push(
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier(key),
                  t.arrowFunctionExpression(
                    [],
                    t.objectExpression(
                      Object.keys(set[key]!).map((currkey) =>
                        t.objectProperty(
                          t.identifier(currkey),
                          t.valueToNode(set[key]![currkey]),
                        ),
                      ),
                    ),
                  ),
                ),
              ]),
            ),
          );
        });
      },
    },
    ExportNamedDeclaration(path: Babel.NodePath<t.ExportNamedDeclaration>) {
      const { node } = path;
      let funNode;
      let confName: string;
      if (t.isVariableDeclaration(node.declaration)) {
        node.declaration.declarations.some((dec) => {
          if (
            t.isVariableDeclarator(dec) &&
            t.isIdentifier(dec.id) &&
            keys.includes(dec.id.name)
          ) {
            const { init } = dec;
            funNode = init;
            confName = dec.id.name;
            return true;
          }
        });
      }
      node.specifiers.some((spec) => {
        if (
          t.isExportSpecifier(spec) &&
          t.isIdentifier(spec.exported) &&
          keys.includes(spec.exported.name)
        ) {
          funNode = getIdentifierDeclaration(spec.local, path);
          confName = spec.exported.name;
          return true;
        }
      });
      if (funNode) {
        keys.splice(
          keys.findIndex((key) => key === confName),
          1,
        );
        changeFunctionReturnStatement(funNode, set[confName!]);
      }
    },
  });
  const code = generate(ast);
  return { code };
}

function getIdentifierDeclaration(node: t.Node, path: Babel.NodePath) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    const bindingPath = path.scope.getBinding(node.name)!.path;
    let bindingNode = bindingPath.node;
    if (t.isImportDefaultSpecifier(bindingNode) && bindingPath.parentPath) {
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

function changeFunctionReturnStatement(
  node: t.Node,
  setProps?: Record<string, any>,
) {
  assert(setProps, `change runtime config should not to be null`);
  if (!t.isArrowFunctionExpression(node) && !t.isFunctionExpression(node)) {
    return;
  }
  const { body } = node;
  let retNode: t.ObjectExpression | undefined;
  if (t.isObjectExpression(body)) {
    retNode = body;
  } else if (t.isBlockStatement(body)) {
    const retSta = body.body.find((n) => t.isReturnStatement(n)) as
      | t.ReturnStatement
      | undefined;
    if (!retSta) {
      retNode = t.objectExpression([]);
      body.body.push(t.returnStatement(retNode));
    } else if (t.isObjectExpression(retSta?.argument)) {
      retNode = retSta?.argument;
    }
  }
  assert(retNode, `find return statement node should not to be null`);
  Object.keys(setProps).forEach((key) => {
    retNode?.properties.push(
      t.objectProperty(t.identifier(key), t.valueToNode(setProps[key])),
    );
  });
}
