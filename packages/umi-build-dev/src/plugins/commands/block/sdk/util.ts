import * as t from '@babel/types';
import * as parser from '@babel/parser';
import { join, basename } from 'path';

export function findExportDefaultDeclaration(programNode) {
  for (const n of programNode.body) {
    if (t.isExportDefaultDeclaration(n)) {
      return n.declaration;
    }
  }
}

export function findImportNodes(programNode) {
  return programNode.body.filter(n => {
    return t.isImportDeclaration(n);
  });
}

function findImportWithSource(importNodes, source) {
  for (const importNode of importNodes) {
    if (importNode.source.value === source) {
      return importNode;
    }
  }
}

function findSpecifier(importNode, specifier) {
  for (const s of importNode.specifiers) {
    if (t.isImportDefaultSpecifier(specifier) && t.isImportDefaultSpecifier(s)) return true;
    if (specifier.imported.name === s.imported.name) {
      if (specifier.local.name === s.local.name) return true;
      throw new Error('specifier conflicts');
    }
  }
  return false;
}

function combineSpecifiers(newImportNode, originImportNode) {
  newImportNode.specifiers.forEach(specifier => {
    if (!findSpecifier(originImportNode, specifier)) {
      originImportNode.specifiers.push(specifier);
    }
  });
}

export function getValidStylesName(path) {
  let name = 'styles';
  let count = 1;
  while (path.scope.hasBinding(name)) {
    name = `styles${count}`;
    count += 1;
  }
  return name;
}

export function combineImportNodes(
  programNode,
  originImportNodes,
  newImportNodes,
  absolutePath,
  stylesName,
) {
  newImportNodes.forEach(newImportNode => {
    // replace stylesName
    // TODO: 自动生成新的 name，不仅仅是 styles
    if (stylesName !== 'styles' && newImportNode.source.value.charAt(0) === '.') {
      newImportNode.specifiers.forEach(specifier => {
        if (t.isImportDefaultSpecifier(specifier) && specifier.local.name === 'styles') {
          specifier.local.name = stylesName;
        }
      });
    }

    const importSource = newImportNode.source.value;
    if (importSource.charAt(0) === '.') {
      // /a/b/c.js -> b
      const dir = basename(join(absolutePath, '..'));
      newImportNode.source = t.stringLiteral(`./${join(dir, importSource)}`);
    }
    const originImportNode = findImportWithSource(originImportNodes, newImportNode.source.value);
    if (!originImportNode) {
      programNode.body.unshift(newImportNode);
    } else {
      combineSpecifiers(newImportNode, originImportNode);
    }
  });
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

/**
 * React child function
 * <Bar>
 *  {foo => <div />}
 * </Bar>
 *
 * or
 * React.createElement(Media, { query: "(max-width: 599px)" }, isMobile => {} })
 * @param node
 */
export function isChildFunc(node) {
  return (
    (t.isJSXElement(node) && node.children.some(child => t.isJSXExpressionContainer(child))) ||
    (isReactCreateElement(node) && node.arguments.some(arg => t.isArrowFunctionExpression(arg)))
  );
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
