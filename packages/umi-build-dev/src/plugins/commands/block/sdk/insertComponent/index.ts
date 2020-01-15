import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import assert from 'assert';
import prettier from 'prettier';
import { findLastIndex } from 'lodash';
import uppercamelcase from 'uppercamelcase';
import { readFileSync, readdirSync } from 'fs';
import { dirname } from 'path';
import rimraf from 'rimraf';
import {
  findExportDefaultDeclaration,
  findImportNodes,
  getIdentifierDeclaration,
  getReturnNode,
  haveChildren,
  isJSXElement,
  findIndex,
  parseContent,
  combineImportNodes,
  getValidStylesName,
} from '../util';
import {
  BLOCK_LAYOUT_PREFIX,
  INSERT_BLOCK_PLACEHOLDER,
  UMI_UI_FLAG_PLACEHOLDER,
} from '../constants';

export default (content, opts) => {
  const {
    // 绝对路径，提取插入时用
    absolutePath,
    // 是否提取区块到当前文件，完成后删除具体的区块及其目录
    isExtractBlock,
    // 测试时不删除
    dontRemoveExtractedBlock,
    relativePath,
    identifier,
    index = 0,
    latest,
  } = opts;

  function addImport(node, id) {
    const { body } = node;
    const lastImportSit = findLastIndex(body, (item: object) => t.isImportDeclaration(item));
    const newImport = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier(id))],
      t.stringLiteral(relativePath),
    );
    body.splice(lastImportSit + 1, 0, newImport);
  }

  function getExtractBlockNode(stylesName) {
    const code = readFileSync(absolutePath, 'utf-8');
    const ast = parseContent(code);
    let returnNode = null;
    let importNodes = [];
    traverse(ast, {
      Program(path) {
        const { node } = path;
        let d = findExportDefaultDeclaration(node) as any;
        d = getIdentifierDeclaration(d, path);

        const ret = getReturnNode(d, path);
        returnNode = ret.node;

        importNodes = findImportNodes(node);
      },
      Identifier(path) {
        const { node } = path;
        if (node.name === 'styles') {
          node.name = stylesName;
        }
      },
    });
    return {
      returnNode,
      importNodes,
    };
  }

  function addBlockToJSX({ newNode, node, replace, id }) {
    assert(isJSXElement(node), 'add block to jsx failed, not valid jsx element');

    // Build new node
    if (!newNode) {
      newNode = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(id), [], true), null, [], true);
    }

    if (haveChildren(node)) {
      // 是否最后插入
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

  if (typeof index === 'string' && index.startsWith(BLOCK_LAYOUT_PREFIX)) {
    const targetIndex = parseInt(index.replace(BLOCK_LAYOUT_PREFIX, ''), 10);
    let currIndex = 0;
    traverse(ast, {
      // TODO: remove import { UmiUIFlag } from 'umi'
      // TODO: remove import { UmiUIFlag, AAA } from 'umi' => import { AAA } from 'umi'
      // ImportDeclaration: {
      //   exit(path) {
      //     const { node } = path;
      //     const specifierIndex = node.specifiers.findIndex(
      //       specify =>
      //         t.isImportSpecifier(specify) && specify.imported.name === UMI_UI_FLAG_PLACEHOLDER,
      //     );
      //     if (specifierIndex > -1) {
      //       if (node.specifiers.length === 1) {
      //         // import { UmiUIFlag } from 'umi'
      //         path.remove();
      //       } else {
      //         path.get(`specifiers.${specifierIndex}`).remove();
      //       }
      //     }
      //   },
      // },
      // support <UmiUIFlag inline={} />
      JSXElement(path) {
        const { node } = path;
        const { openingElement } = node;
        if (
          t.isJSXIdentifier(openingElement.name) &&
          openingElement.name.name === UMI_UI_FLAG_PLACEHOLDER
        ) {
          if (targetIndex === currIndex) {
            // 添加过之后无需提示
            const id = uppercamelcase(identifier);
            addImport(path.findParent(p => p.isProgram()).node, id);
            const newNode = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(id), [], true),
              null,
              [],
              true,
            );
            path.parent.children.push(newNode);
            // remove <UmiUIFlag />
            path.remove();
          }
          currIndex += 1;
        }
      },
      JSXText(path) {
        const { node } = path;
        const { value } = node;
        if (value.trim().startsWith(INSERT_BLOCK_PLACEHOLDER)) {
          if (targetIndex === currIndex) {
            // 添加过之后无需提示
            node.value = INSERT_BLOCK_PLACEHOLDER;

            const id = uppercamelcase(identifier);
            addImport(path.findParent(p => p.isProgram()).node, id);
            const newNode = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(id), [], true),
              null,
              [],
              true,
            );
            path.parent.children.push(newNode);
          }
          currIndex += 1;
        }
      },
    });
  } else {
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

        if (isExtractBlock) {
          const stylesName = getValidStylesName(path);

          const { returnNode, importNodes } = getExtractBlockNode(stylesName);
          const originImportNodes = findImportNodes(node);

          combineImportNodes(node, originImportNodes, importNodes, absolutePath, stylesName);

          addBlockToJSX({
            ...ret,
            id,
            newNode: returnNode,
          });

          // 清理目录
          if (!dontRemoveExtractedBlock) {
            rimraf.sync(absolutePath);
            if (readdirSync(dirname(absolutePath)).length === 0) {
              rimraf.sync(dirname(absolutePath));
            }
          }
        } else {
          addImport(node, id);
          addBlockToJSX({
            ...ret,
            id,
            newNode: null,
          });
        }
      },
    });
  }
  // console.log(JSON.stringify(ast, null, 2));
  const newCode = generate(ast, {}).code;
  return prettier.format(newCode, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'typescript',
  });
};
