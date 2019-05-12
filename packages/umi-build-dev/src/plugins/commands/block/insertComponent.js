import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import prettier from 'prettier';
import { findLastIndex } from 'lodash';

export default function(content, { relativePath, identifier }) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx'],
  });
  traverse(ast, {
    Program({ node }) {
      const { body } = node;
      const lastImportSit = findLastIndex(body, item => {
        return t.isImportDeclaration(item);
      });
      const newImport = t.ImportDeclaration(
        [t.ImportDefaultSpecifier(t.identifier(identifier))],
        t.stringLiteral(relativePath),
      );
      body.splice(lastImportSit + 1, 0, newImport);
    },
    ClassMethod({ node }) {
      const { key, body } = node;
      if (
        t.isIdentifier(key, {
          name: 'render',
        })
      ) {
        if (t.isBlockStatement(body)) {
          const { body: blocks } = body;
          const returnBlock = blocks.find(b => {
            return t.isReturnStatement(b);
          });
          if (t.isJSXElement(returnBlock.argument)) {
            // https://babeljs.io/docs/en/babel-types#jsxelement
            const newElement = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(identifier), [], true),
              null,
              [],
              true,
            );
            returnBlock.argument.children.push(newElement);
          }
        }
      }
    },
  });
  const newCode = generate(ast, {}).code;
  return prettier.format(newCode, {
    // format same as ant-design-pro
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'babylon',
  });
}
