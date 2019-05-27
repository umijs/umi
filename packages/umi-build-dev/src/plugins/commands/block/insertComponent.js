import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import prettier from 'prettier';
import { findLastIndex } from 'lodash';

function insertComponentToRender(blockStatement, identifier) {
  // blockStatement: https://babeljs.io/docs/en/babel-types#blockstatement
  const { body } = blockStatement;
  const returnBlock = body.find(b => {
    return t.isReturnStatement(b);
  });
  if (t.isJSXElement(returnBlock.argument)) {
    insertComponentToElement(returnBlock.argument, identifier);
  }
}

function insertComponentToElement(element, identifier) {
  // https://babeljs.io/docs/en/babel-types#jsxelement
  const newElement = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(identifier), [], true),
    null,
    [],
    true,
  );
  element.children.push(newElement);
}

export default function(content, { relativePath, identifier }) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'decorators-legacy', 'typescript'],
  });
  traverse(ast, {
    Program({ node }) {
      // add import
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
      // for class component
      const { key, body } = node;
      if (
        t.isIdentifier(key, {
          name: 'render',
        })
      ) {
        if (t.isBlockStatement(body)) {
          insertComponentToRender(body, identifier);
        }
      }
    },
    ExportDefaultDeclaration({ node }) {
      // for purefunction component
      const { declaration } = node;
      if (t.isArrowFunctionExpression(declaration) || t.isFunctionDeclaration(declaration)) {
        if (t.isBlockStatement(declaration.body)) {
          insertComponentToRender(declaration.body, identifier);
        } else if (t.isJSXElement(declaration.body)) {
          insertComponentToElement(declaration.body, identifier);
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
