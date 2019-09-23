import assert from 'assert';

export default function({ types: t }) {
  function findReturnNode(node) {
    if (t.isJSXElement(node)) {
      return node;
    }
    if (t.isBlockStatement(node)) {
      for (const n of node.body) {
        if (t.isReturnStatement(n)) {
          return n.argument;
        }
      }
    }
    throw new Error(`Find return statement failed, unsupported node type ${node.type}.`);
  }

  function findRenderStatement(node) {
    for (const n of node.body) {
      if (t.isClassMethod(n) && t.isIdentifier(n.key) && n.key.name === 'render') {
        return n.body;
      }
    }
    throw new Error(`Find render statement failed`);
  }

  function addFlagToIndex(nodes, i, { index, filename }) {
    nodes.splice(
      i,
      0,
      t.JSXElement(
        t.JSXOpeningElement(t.JSXIdentifier('GUmiUIFlag'), [
          t.JSXAttribute(t.JSXIdentifier('filename'), t.StringLiteral('' + filename)),
          t.JSXAttribute(t.JSXIdentifier('index'), t.StringLiteral('' + index)),
        ]),
        t.JSXClosingElement(t.JSXIdentifier('GUmiUIFlag')),
        [],
      ),
    );
  }

  function addUmiUIFlag(node, { filename }) {
    if (t.isJSXElement(node)) {
      assert(
        node.children && node.children.length,
        `Add umi ui failed, root node must have children.`,
      );
      let index = node.children.filter(n => t.isJSXElement(n)).length;
      let i = node.children.length - 1;
      while (i >= 0) {
        const child = node.children[i];
        if (t.isJSXElement(child) || i === 0) {
          addFlagToIndex(node.children, i === 0 ? i : i + 1, {
            index,
            filename,
          });
          index -= 1;
        }
        i -= 1;
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
            let retNode;

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
              retNode = findReturnNode(d.body);
            } else if (t.isClassDeclaration(d)) {
              retNode = findReturnNode(findRenderStatement(d.body));
            }

            if (retNode) {
              addUmiUIFlag(retNode, {
                filename,
              });
            }
          }
        },
      },
    },
  };
}
