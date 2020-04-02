import { lodash, t, traverse } from '@umijs/utils';
import { parse } from '../utils/parse';
import {
  NODE_RESOLVERS,
  findArrayElements,
  findObjectMembers,
} from './propertyResolver';

export function getExportProps(code: string) {
  const ast = parse(code) as babel.types.File;
  let props: unknown = undefined;

  traverse.default(ast, {
    Program: {
      enter(path) {
        const node = path.node;
        const defaultExport = findExportDefault(node);
        if (!defaultExport) return;

        if (t.isIdentifier(defaultExport)) {
          const { name } = defaultExport;
          props = findAssignmentExpressionProps(node, name);
        } else if (t.isObjectExpression(defaultExport)) {
          props = findObjectMembers(defaultExport);
        } else if (t.isArrayExpression(defaultExport)) {
          props = findArrayElements(defaultExport);
        } else {
          const resolver = NODE_RESOLVERS.find((resolver) =>
            resolver.is(defaultExport),
          );
          if (resolver) {
            props = resolver.get(defaultExport as any);
          }
        }
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

function findAssignmentExpressionProps(programNode: t.Program, name: string) {
  let props = findVariableDeclarationInitialValue(programNode, name);

  for (const n of programNode.body) {
    let node: t.Node = n;
    if (t.isExpressionStatement(node)) {
      node = node.expression;
    }

    if (t.isAssignmentExpression(node)) {
      const assignment = node;

      // `target = value;`
      if (t.isIdentifier(assignment.left) && assignment.left.name === name) {
        const resolver = NODE_RESOLVERS.find((resolver) =>
          resolver.is(assignment.right),
        );
        if (resolver) props = resolver.get(assignment.right as any);
      }

      // `target.key = value;`
      // the target must be assigned a value of the object type,
      // otherwise the member value cannot be assigned
      if (
        t.isMemberExpression(assignment.left) &&
        t.isIdentifier(assignment.left.object) &&
        assignment.left.object.name === name &&
        lodash.isObject(props)
      ) {
        const resolver = NODE_RESOLVERS.find((resolver) =>
          resolver.is(assignment.right),
        );
        if (resolver) {
          props[assignment.left.property.name] = resolver.get(
            assignment.right as any,
          );
        }
      }
    }
  }
  return props;
}

function findVariableDeclarationInitialValue(
  programNode: t.Program,
  name: string,
) {
  let initialValue: unknown = undefined;

  // find the last variable declaration
  for (const node of programNode.body) {
    if (!t.isVariableDeclaration(node)) continue;
    const declaration = node.declarations.find((dec) => {
      return t.isIdentifier(dec.id) && dec.id.name === name;
    });

    if (declaration) {
      const resolver = NODE_RESOLVERS.find((resolver) =>
        resolver.is(declaration.init),
      );
      if (resolver) {
        initialValue = resolver.get(declaration.init as any);
      }
    }
  }

  return initialValue;
}
