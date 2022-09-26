import type { NodePath } from '@umijs/bundler-utils/compiled/babel/traverse';
import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { parse } from '../utils/parse';

export function setConfigByName(ast: t.File, name: string, value: any) {
  let _value: any;
  let valueObject: any;
  let isChanged: boolean = false;
  try {
    _value = JSON.parse(value);
  } catch (error) {
    _value = value;
  }
  const simulateCode = `const __JSON__ = ${JSON.stringify(_value)}`;
  const simulateAst = parse(simulateCode);
  traverse.default(simulateAst, {
    VariableDeclarator(path) {
      //@ts-ignore
      if (path.node.id?.name === '__JSON__') {
        valueObject = path.node.init;
      }
    },
  });
  if (!valueObject) return;
  // 这里是修改逻辑
  traverse.default(ast, {
    ObjectProperty(path) {
      //@ts-ignore
      if (path.node.key?.name === name) {
        path.node.value = valueObject;
        isChanged = true;
      }
    },
  });
  if (!isChanged) {
    let modified = false;
    traverse.default(ast, {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (
          t.isExportDefaultDeclaration(path.parent) &&
          t.isIdentifier(path.node.callee, { name: 'defineConfig' }) &&
          t.isObjectExpression(path.node.arguments[0])
        ) {
          path.node.arguments[0].properties.push(
            t.objectProperty(t.identifier(name), valueObject),
          );
          modified = true;
          path.stop();
        }
      },

      ObjectExpression(path: NodePath<t.ObjectExpression>) {
        if (t.isExportDefaultDeclaration(path.parent)) {
          path.node.properties.push(
            t.objectProperty(t.identifier(name), valueObject),
          );
          modified = true;
          path.stop();
        }
      },
    });

    if (!modified) {
      console.error(
        `export config format can not be analysis, please reference to \nhttps://next.umijs.org/zh-CN/docs/guides/config-convention`,
      );
      throw Error(`Can't modify config file, due to file format`);
    }
  }
  return ast;
}

const config = { dva: {} };
export default config;
