import { readFileSync, writeFileSync } from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import assert from 'assert';

export default function({ key, value, file }) {
  const newContent = update({
    key,
    value,
    content: readFileSync(file, 'utf-8'),
  });
  writeFileSync(file, `${newContent}\n`, 'utf-8');
}

function buildExpression(str) {
  if (str.startsWith('{')) {
    // do nothing
  } else if (str === 'true' || str === 'false') {
    // do nothing
  } else {
    str = `'${str}'`;
  }
  return template(`(${str})`)().expression;
}

export function update({ key, value, content }) {
  const ast = parser.parse(content, {
    sourceType: 'module',
  });
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      assert(
        t.isObjectExpression(path.node.declaration),
        `config file must export default a Plain Object`,
      );
      if (t.isObjectExpression(path.node.declaration)) {
        const { properties } = path.node.declaration;
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
          properties.push(
            t.objectProperty(t.identifier(key), buildExpression(value)),
          );
        }
      }
    },
  });
  return generate(ast, {}).code;
}
