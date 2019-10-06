import assert from 'assert';
import { winPath } from 'umi-utils';
import {
  findExportDefaultDeclaration,
  getIdentifierDeclaration,
  isReactCreateElement,
  getReturnNode,
  isJSXElement,
  haveChildren,
} from '../util';

export default ({ types: t }) => {
  function buildGUmiUIFlag({ index, filename, jsx }) {
    if (jsx) {
      return t.JSXElement(
        t.JSXOpeningElement(t.JSXIdentifier('GUmiUIFlag'), [
          t.JSXAttribute(t.JSXIdentifier('filename'), t.StringLiteral(`${filename}`)),
          t.JSXAttribute(t.JSXIdentifier('index'), t.StringLiteral(`${index}`)),
        ]),
        t.JSXClosingElement(t.JSXIdentifier('GUmiUIFlag')),
        [],
      );
    }
    return t.CallExpression(
      t.MemberExpression(t.Identifier('React'), t.Identifier('createElement')),
      [
        t.Identifier('GUmiUIFlag'),
        t.ObjectExpression([
          t.ObjectProperty(t.Identifier('filename'), t.StringLiteral(`${filename}`)),
          t.ObjectProperty(t.Identifier('index'), t.StringLiteral(`${index}`)),
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
            ? t.JSXFragment(t.JSXOpeningFragment(), t.JSXClosingFragment(), [
                buildGUmiUIFlag({ index: 0, filename, jsx: true }),
                node,
                buildGUmiUIFlag({ index: 1, filename, jsx: true }),
              ])
            : t.CallExpression(
                t.MemberExpression(t.Identifier('React'), t.Identifier('createElement')),
                [
                  t.MemberExpression(t.Identifier('React'), t.Identifier('Fragment')),
                  t.NullLiteral(),
                  buildGUmiUIFlag({ index: 0, filename, jsx: false }),
                  node,
                  buildGUmiUIFlag({ index: 1, filename, jsx: false }),
                ],
              ),
        );
      }
    } else {
      throw new Error(`Add umi ui flag failed, unsupported node type ${node.type}.`);
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

            const ret = getReturnNode(d);
            if (ret) {
              const { node: retNode, replace } = ret;
              if (retNode) {
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
