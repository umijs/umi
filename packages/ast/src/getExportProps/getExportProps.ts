import { t, traverse } from '@umijs/utils';
import { parse } from '../utils/parse';

export function getExportProps(code: string) {
  const ast = parse(code);
  let props = {};
  traverse.default(ast as any, {
    Program: {
      enter(path: any) {
        const node = path.node;
        const defaultExport = findExportDefault(node);
        if (!defaultExport || !t.isIdentifier(defaultExport)) return;

        const { name } = defaultExport;
        props = findAssignmentExpressionProps({
          programNode: node,
          name,
        });
      },
    },
  });
  return props;
}

function findExportDefault(programNode: t.Program) {
  for (const n of programNode.body) {
    if (t.isExportDefaultDeclaration(n)) {
      return n.declaration;
    }
  }
  return null;
}

function isLiteral(src: any): src is t.StringLiteral {
  return (
    t.isStringLiteral(src) || t.isNumericLiteral(src) || t.isBooleanLiteral(src)
  );
}

function findObjectProperties(node: t.ObjectExpression) {
  const target = {};
  node.properties.forEach(p => {
    if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
      if (isLiteral(p.value)) {
        target[p.key.name] = p.value.value;
      } else if (t.isObjectExpression(p.value)) {
        target[p.key.name] = findObjectProperties(p.value);
      } else if (t.isArrayExpression(p.value)) {
        target[p.key.name] = findArrayProperties(p.value);
      }
    }
  });
  return target;
}

function findArrayProperties(node: t.ArrayExpression) {
  const target: any[] = [];
  node.elements.forEach(p => {
    if (isLiteral(p)) {
      target.push(p.value);
    } else if (t.isObjectExpression(p)) {
      target.push(findObjectProperties(p));
    } else if (t.isArrayExpression(p)) {
      target.push(findArrayProperties(p));
    }
  });
  return target;
}

function findAssignmentExpressionProps(opts: {
  programNode: t.Program;
  name: string;
}) {
  const props = {};
  for (const n of opts.programNode.body) {
    let node = n;
    if (t.isExpressionStatement(node)) {
      // @ts-ignore
      node = node.expression;
    }
    if (
      t.isAssignmentExpression(node) &&
      t.isMemberExpression(node.left) &&
      t.isIdentifier(node.left.object) &&
      node.left.object.name === opts.name
    ) {
      if (isLiteral(node.right)) {
        props[node.left.property.name] = node.right.value;
      } else if (t.isObjectExpression(node.right)) {
        props[node.left.property.name] = findObjectProperties(node.right);
      } else if (t.isArrayExpression(node.right)) {
        props[node.left.property.name] = findArrayProperties(node.right);
      }
    }
  }
  return props;
}
