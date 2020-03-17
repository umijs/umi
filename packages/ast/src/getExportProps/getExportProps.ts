import { t, traverse } from '@umijs/utils';
import { parse } from '../utils/parse';
import { RESOLVABLE_WHITELIST } from './propertyResolver';

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
      node.left.object.name === opts.name
    ) {
      const resolver = RESOLVABLE_WHITELIST.find(resolver =>
        resolver.is(t.isAssignmentExpression(node) && node.right),
      );
      if (resolver) {
        props[node.left.property.name] = resolver.get(node.right as any);
      }
    }
  }
  return props;
}
