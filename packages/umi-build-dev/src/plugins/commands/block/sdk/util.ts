import * as t from '@babel/types';
import * as parser from '@babel/parser';

export function findExportDefaultDeclaration(node) {
  for (const n of node.body) {
    if (t.isExportDefaultDeclaration(n)) {
      return n.declaration;
    }
  }
}

export function getIdentifierDeclaration(node, path) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    let bindingNode = path.scope.getBinding(node.name).path.node;
    if (t.isVariableDeclarator(bindingNode)) {
      bindingNode = bindingNode.init;
    }
    return bindingNode;
  }
  return node;
}

export function isReactCreateElement(node) {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object, { name: 'React' }) &&
    t.isIdentifier(node.callee.property, { name: 'createElement' })
  );
}

export function isJSXElement(node) {
  return t.isJSXElement(node) || t.isJSXFragment(node) || isReactCreateElement(node);
}

export function haveChildren(node) {
  if (t.isJSXElement(node) || t.isJSXFragment(node)) {
    return node.children && node.children.length;
  } else {
    return !!node.arguments[2];
  }
}

export function getReturnNode(node, path) {
  if (
    t.isArrowFunctionExpression(node) ||
    t.isFunctionDeclaration(node) ||
    t.isFunctionExpression(node)
  ) {
    return findReturnNode(node, path);
  } else if (t.isClassDeclaration(node) || t.isClassExpression(node)) {
    const renderStatement = findRenderStatement(node.body);
    if (renderStatement) {
      return findReturnNode(renderStatement, path);
    }
  }
}

function findReturnNode(node, path) {
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

  // if (t.isConditionalExpression(node.body)) {
  //   return getReturnNode({
  //     body: getIdentifierDeclaration(node.body.consequent, path),
  //   }, path);
  // }

  // throw new Error(`Find return statement failed, unsupported node type ${node.body.type}.`);
}

function findRenderStatement(node) {
  for (const n of node.body) {
    if (t.isClassMethod(n) && t.isIdentifier(n.key) && n.key.name === 'render') {
      return n;
    }
  }
  // throw new Error(`Find render statement failed`);
}

export function findIndex(arr, index, fn) {
  if (index === 0) return 0;

  let foundCount = 0;
  for (const [i, item] of arr.entries()) {
    if (fn(item)) {
      foundCount += 1;
    }
    if (foundCount === index) {
      return i + 1;
    }
  }

  throw new Error(`Invalid find index params.`);
}

export function parseContent(code) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'decorators-legacy', 'typescript', 'classProperties', 'dynamicImport'],
  });
}
