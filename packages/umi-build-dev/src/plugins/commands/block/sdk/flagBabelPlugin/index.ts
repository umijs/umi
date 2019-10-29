import assert from 'assert';
import { winPath } from 'umi-utils';
import * as t from '@babel/types';
import {
  findExportDefaultDeclaration,
  getIdentifierDeclaration,
  isReactCreateElement,
  getReturnNode,
  isJSXElement,
  haveChildren,
} from '../util';

export default () => {
  function buildGUmiUIFlag({ index, filename, jsx }) {
    if (jsx) {
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('GUmiUIFlag'), [
          t.jsxAttribute(t.jsxIdentifier('filename'), t.stringLiteral(`${filename}`)),
          t.jsxAttribute(t.jsxIdentifier('index'), t.stringLiteral(`${index}`)),
        ]),
        t.jsxClosingElement(t.jsxIdentifier('GUmiUIFlag')),
        [],
        false,
      );
    }

    return t.callExpression(
      t.memberExpression(t.identifier('React'), t.identifier('createElement')),
      [
        t.identifier('GUmiUIFlag'),
        t.objectExpression([
          t.objectProperty(t.identifier('filename'), t.stringLiteral(`${filename}`)),
          t.objectProperty(t.identifier('index'), t.stringLiteral(`${index}`)),
        ]),
      ],
    );
  }

  function addFlagToIndex(nodes, i, { index, filename, jsx }) {
    nodes.splice(i, 0, buildGUmiUIFlag({ index, filename, jsx }));
  }

  function addUmiUIFlag(node, { filename, replace }) {
    if (isJSXElement(node)) {
      if (haveChildren(node)) {
        if (t.isJSXElement(node) || t.isJSXFragment(node)) {
          let index = node.children.filter(n => isJSXElement(n)).length;
          let i = node.children.length - 1;
          while (i >= 0) {
            const child = node.children[i];
            if (isJSXElement(child) || i === 0) {
              addFlagToIndex(node.children, i === 0 ? i : i + 1, {
                index,
                filename,
                jsx: true,
              });
              index -= 1;
            }
            i -= 1;
          }
        } else {
          const args = node.arguments;
          let index = args.filter(n => isReactCreateElement(n)).length;
          let i = args.length - 1;
          while (i >= 1) {
            const arg = args[i];
            if (isReactCreateElement(arg) || i === 1) {
              addFlagToIndex(args, i + 1, {
                index,
                filename,
                jsx: false,
              });
              index -= 1;
            }
            i -= 1;
          }
        }
      } else {
        // root 节点没有 children，则在外面套一层
        replace(
          t.isJSXElement(node)
            ? t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
                buildGUmiUIFlag({ index: 0, filename, jsx: true }) as any,
                node,
                buildGUmiUIFlag({ index: 1, filename, jsx: true }),
              ])
            : t.callExpression(
                t.memberExpression(t.identifier('React'), t.identifier('createElement')),
                [
                  t.memberExpression(t.identifier('React'), t.identifier('Fragment')),
                  t.nullLiteral(),
                  buildGUmiUIFlag({ index: 0, filename, jsx: false }),
                  node,
                  buildGUmiUIFlag({ index: 1, filename, jsx: false }),
                ],
              ),
        );
      }
    } else {
      // throw new Error(`Add umi ui flag failed, unsupported node type ${node.type}.`);
    }
  }

  function isInBlackList(node, path) {
    if (t.isJSXElement(node)) {
      const name = node.openingElement.name.name;
      if (path.scope.hasBinding(name)) {
        const p = path.scope.getBinding(name).path;
        const { source } = p.parentPath.node;

        // 只处理 import 的声明
        if (!t.isImportDeclaration(p.parentPath.node)) return;

        if (source.value === 'react-document-title') {
          return true;
        }

        // antd 和 @alipay/tech-ui 里除部分用于布局的组件之外，其他组件作为根组件不会插入编辑区
        if (
          (source.value === 'antd' || source.value === '@alipay/bigfish/antd') &&
          t.isImportSpecifier(p.node) &&
          t.isIdentifier(p.node.imported) &&
          !['Card', 'Grid', 'Layout'].includes(p.node.imported.name)
        ) {
          return true;
        }
        if (
          source.value === '@alipay/tech-ui' &&
          t.isImportSpecifier(p.node) &&
          t.isIdentifier(p.node.imported) &&
          !['PageContainer'].includes(p.node.imported.name)
        ) {
          return true;
        }
      }
    }
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const { filename, opts = {} } = state;
          assert(opts.doTransform, 'opts.doTransform must supplied');

          if (opts.doTransform(filename)) {
            const { node } = path;

            let d: any = findExportDefaultDeclaration(node);

            // Support hoc
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
            if (ret) {
              const { node: retNode, replace } = ret;
              if (retNode && !isInBlackList(retNode, path)) {
                addUmiUIFlag(retNode, {
                  filename: winPath(filename),
                  replace,
                });
              }
            }
          }
        },
      },
    },
  };
};
