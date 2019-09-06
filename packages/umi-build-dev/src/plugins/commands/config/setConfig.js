import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import assert from 'assert';
import prettier from 'prettier';

export default function({ key, value, file }) {
  let content = `export default {}`;
  if (existsSync(file)) {
    content = readFileSync(file, 'utf-8');
  }
  const newContent = update(content, key, value);
  writeFileSync(file, `${newContent}\n`, 'utf-8');
}

function buildExpression(keys, str) {
  if (str.startsWith('{') || str.startsWith('[')) {
    // do nothing
  } else if (str === 'true' || str === 'false') {
    // do nothing
  } else {
    str = `'${str}'`;
  }
  let exp = template(`(${str})`)().expression;

  let i = 0;
  keys = keys.reverse();
  while (i < keys.length) {
    exp = t.objectExpression([t.objectProperty(t.identifier(keys[i]), exp)]);
    i += 1;
  }

  return exp;
}

export function update(content, key, value) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      let node = path.node.declaration;

      // export default {} as IConfig;
      if (node.type === 'TSAsExpression') {
        node = node.expression;
      }

      // const a;
      // export default a;
      if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
        const bindingNode = path.scope.getBinding(node.name).path.node;
        if (t.isVariableDeclarator(bindingNode)) {
          node = bindingNode.init;
        }
      }

      assert(t.isObjectExpression(node), `config file must export default a Plain Object`);
      if (t.isObjectExpression(node)) {
        let { properties } = node;

        let obj = key;
        if (typeof key === 'string') {
          obj = {
            [key]: value,
          };
        }

        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const keys = key.split('.');
          let i = 0;
          while (i < keys.length) {
            let hasFound;
            for (const property of properties) {
              if (
                t.isIdentifier(property.key, {
                  name: keys[i],
                })
              ) {
                if (i === keys.length - 1 || !t.isObjectExpression(property.value)) {
                  property.value = buildExpression(keys.slice(i + 1), value);
                  return;
                } else {
                  properties = property.value.properties;
                }
                hasFound = true;
                break;
              }
            }
            if (!hasFound) {
              properties.push(
                t.objectProperty(t.identifier(keys[i]), buildExpression(keys.slice(i + 1), value)),
              );
              break;
            } else {
              i += 1;
            }
          }
        });
      }
    },
  });
  const newCode = generate(ast, {}).code;
  return prettier.format(newCode, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'typescript',
  });
}
