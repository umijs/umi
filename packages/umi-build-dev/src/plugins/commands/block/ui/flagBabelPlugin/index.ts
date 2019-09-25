import assert from 'assert';

export default function({ types: t }) {
  function isReactCreateElement(node) {
    return (
      t.isCallExpression(node) &&
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.object, { name: 'React' }) &&
      t.isIdentifier(node.callee.property, { name: 'createElement' })
    );
  }

  function isJSXElement(node) {
    return t.isJSXElement(node) || isReactCreateElement(node);
  }

  function haveChildren(node) {
    if (t.isJSXElement(node)) {
      return node.children && node.children.length;
    } else {
      return !!node.arguments[2];
    }
  }

  function findReturnNode(node) {
    if (isJSXElement(node.body)) {
      return {
        node: node.body,
        replace(newNode) {
          node.body = newNode;
        },
      };
    }
    if (t.isBlockStatement(node.body)) {
      for (const n of node.body.body) {
        if (t.isReturnStatement(n)) {
          return {
            node: n.argument,
            replace(newNode) {
              n.argument = newNode;
            },
          };
        }
      }
    }
    throw new Error(`Find return statement failed, unsupported node type ${node.body.type}.`);
  }

  function findRenderStatement(node) {
    for (const n of node.body) {
      if (t.isClassMethod(n) && t.isIdentifier(n.key) && n.key.name === 'render') {
        return n;
      }
    }
    throw new Error(`Find render statement failed`);
  }

  function buildGUmiUIFlag({ index, filename, jsx }) {
    if (jsx) {
      return t.JSXElement(
        t.JSXOpeningElement(t.JSXIdentifier('GUmiUIFlag'), [
          t.JSXAttribute(t.JSXIdentifier('filename'), t.StringLiteral('' + filename)),
          t.JSXAttribute(t.JSXIdentifier('index'), t.StringLiteral('' + index)),
        ]),
        t.JSXClosingElement(t.JSXIdentifier('GUmiUIFlag')),
        [],
      );
    } else {
      return t.CallExpression(
        t.MemberExpression(t.Identifier('React'), t.Identifier('createElement')),
        [
          t.Identifier('GUmiUIFlag'),
          t.ObjectExpression([
            t.ObjectProperty(t.Identifier('filename'), t.StringLiteral('' + filename)),
            t.ObjectProperty(t.Identifier('index'), t.StringLiteral('' + index)),
          ]),
        ],
      );
    }
  }

  function addFlagToIndex(nodes, i, { index, filename, jsx }) {
    nodes.splice(i, 0, buildGUmiUIFlag({ index, filename, jsx }));
  }

  function addUmiUIFlag(node, { filename, replace }) {
    if (isJSXElement(node)) {
      if (haveChildren(node)) {
        if (t.isJSXElement(node)) {
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
          let i = args.length - 1;
          while (i >= 1) {
            const arg = args[i];
            let index = args.filter(n => isReactCreateElement(n)).length;
            if (isReactCreateElement(arg) || i === 1) {
              addFlagToIndex(args, i, {
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

  function findExportDefaultDeclaration(node) {
    for (const n of node.body) {
      if (t.isExportDefaultDeclaration(n)) {
        return n.declaration;
      }
    }
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const { filename, opts = {} } = state;
          assert(opts.doTransform, `opts.doTransform must supplied`);

          if (opts.doTransform(filename)) {
            const { node } = path;

            let d = findExportDefaultDeclaration(node);
            let ret;

            if (t.isIdentifier(d)) {
              d = path.scope.getBinding(d.name).path.node;
              if (t.isVariableDeclarator(d)) {
                d = d.init;
              }
            }

            if (
              t.isArrowFunctionExpression(d) ||
              t.isFunctionDeclaration(d) ||
              t.isFunctionExpression(d)
            ) {
              ret = findReturnNode(d);
            } else if (t.isClassDeclaration(d)) {
              ret = findReturnNode(findRenderStatement(d.body));
            }

            const { node: retNode, replace } = ret;
            if (retNode) {
              addUmiUIFlag(retNode, {
                filename,
                replace,
              });
            }
          }
        },
      },
    },
  };
}
