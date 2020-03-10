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
      (t.isStringLiteral(node.right) ||
        t.isNumericLiteral(node.right) ||
        t.isBooleanLiteral(node.right))
    ) {
      props[node.left.property.name] = (node.right as t.StringLiteral).value;
    }
  }
  return props;
}
