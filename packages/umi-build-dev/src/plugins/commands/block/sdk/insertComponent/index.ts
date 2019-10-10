import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import assert from 'assert';
import prettier from 'prettier';
import { findLastIndex } from 'lodash';
import uppercamelcase from 'uppercamelcase';
import {
  findExportDefaultDeclaration,
  getIdentifierDeclaration,
  getReturnNode,
  haveChildren,
  isJSXElement,
  findIndex,
  parseContent,
} from '../util';

export default (content, opts) => {
  const { relativePath, identifier, index = 0, latest } = opts;

  function addImport(node, id) {
    const { body } = node;
    const lastImportSit = findLastIndex(body, (item: object) => t.isImportDeclaration(item));
    const newImport = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier(id))],
      t.stringLiteral(relativePath),
    );
    body.splice(lastImportSit + 1, 0, newImport);
  }

  function addBlockToJSX({ node, replace, id }) {
    assert(isJSXElement(node), 'add block to jsx failed, not valid jsx element');

    const newNode = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier(id), [], true),
      null,
      [],
      true,
    );
    if (haveChildren(node)) {
      if (latest) {
        node.children.push(newNode);
      } else {
        const insertIndex = findIndex(node.children, index, isJSXElement);
        node.children.splice(insertIndex, 0, newNode);
      }
    } else {
      replace(
        t.jsxFragment(
          t.jsxOpeningFragment(),
          t.jsxClosingFragment(),
          index === 0 ? [newNode, node] : [node, newNode],
        ),
      );
    }
  }

  const ast = parseContent(content);
  traverse(ast, {
    Program(path) {
      const { node } = path;

      let d = findExportDefaultDeclaration(node) as any;

      // support hoc
      while (t.isCallExpression(d)) {
        // eslint-disable-next-line
        d = d.arguments[0];
      }

      d = getIdentifierDeclaration(d, path);

      // Support hoc again
      while (t.isCallExpression(d)) {
        // eslint-disable-next-line
        d = d.arguments[0];
      }

      const ret = getReturnNode(d, path);
      assert(ret, 'Can not find return node');

      const id = uppercamelcase(identifier);
      // TODO: check id exists

      // Add imports
      addImport(node, id);

      // Add xxxx
      addBlockToJSX({
        ...ret,
        id,
      });
    },
  });
  const newCode = generate(ast, {}).code;
  return prettier.format(newCode, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'typescript',
  });
};
