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

function buildExpression(str) {
  if (str.startsWith('{') || str.startsWith('[')) {
    // do nothing
  } else if (str === 'true' || str === 'false') {
    // do nothing
  } else {
    str = `'${str}'`;
  }
  return template(`(${str})`)().expression;
}

export function update(content, key, value) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      let node = path.node.declaration;
      if (node.type === 'TSAsExpression') {
        node = node.expression;
      }
      assert(t.isObjectExpression(node), `config file must export default a Plain Object`);
      if (t.isObjectExpression(node)) {
        const { properties } = node;
        let hasFound;
        for (const property of properties) {
          if (
            t.isIdentifier(property.key, {
              name: key,
            })
          ) {
            property.value = buildExpression(value);
            hasFound = true;
            break;
          }
        }
        if (!hasFound) {
          properties.push(t.objectProperty(t.identifier(key), buildExpression(value)));
        }
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
