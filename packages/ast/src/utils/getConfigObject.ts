import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

// The bundled Babel parser supports satisfies, but its type declarations
// predate that node type.
type TSSatisfiesExpression = {
  type: 'TSSatisfiesExpression';
  expression: t.Expression;
};

function unwrapExpression(
  node: t.Node | TSSatisfiesExpression | null | undefined,
) {
  while (
    node?.type === 'TSSatisfiesExpression' ||
    t.isTSAsExpression(node) ||
    t.isTSTypeAssertion(node) ||
    t.isTSNonNullExpression(node) ||
    t.isParenthesizedExpression(node)
  ) {
    node = node.expression;
  }
  return node;
}

function getConfigValue(node: t.Node | null | undefined) {
  const value = unwrapExpression(node);
  return t.isCallExpression(value) &&
    t.isIdentifier(value.callee, { name: 'defineConfig' })
    ? unwrapExpression(value.arguments[0])
    : value;
}

function getLocalConfigObject(
  ast: t.File,
  declaration: t.ExportDefaultDeclaration,
  reference: t.Identifier,
) {
  let config: t.ObjectExpression | undefined;
  traverse.default(ast, {
    Program(path) {
      const binding = path.scope.getBinding(reference.name);
      if (
        binding?.kind !== 'const' ||
        !binding.constant ||
        !binding.path.isVariableDeclarator() ||
        !t.isIdentifier(binding.path.node.id, { name: reference.name }) ||
        binding.referencePaths.length !== 1 ||
        binding.referencePaths[0].node !== reference
      ) {
        return;
      }
      const statement = binding.path.parent;
      const body = path.node.body;
      const index = t.isVariableDeclaration(statement)
        ? body.indexOf(statement)
        : -1;
      if (index < 0 || index >= body.indexOf(declaration)) return;

      // A const binding can still expose a mutable object through other uses.
      // Only edit a local initializer used directly by this default export.
      const value = getConfigValue(binding.path.node.init);
      if (t.isObjectExpression(value)) config = value;
    },
  });
  return config;
}

export function getConfigObject(ast: t.File): t.ObjectExpression {
  const declaration = ast.program.body.find((node) =>
    t.isExportDefaultDeclaration(node),
  );
  if (t.isExportDefaultDeclaration(declaration)) {
    const config = getConfigValue(declaration.declaration);
    if (t.isObjectExpression(config)) return config;
    if (t.isIdentifier(config)) {
      const local = getLocalConfigObject(ast, declaration, config);
      if (local) return local;
    }
  }

  throw new Error(
    "Can't modify config file, due to file format. Use an inline object, or a local const object referenced only by the default export, with or without defineConfig.",
  );
}

export function isConfigProperty(
  property: t.ObjectExpression['properties'][number],
  name: string,
): property is t.ObjectProperty | t.ObjectMethod {
  return (
    (t.isObjectProperty(property) || t.isObjectMethod(property)) &&
    (t.isStringLiteral(property.key, { value: name }) ||
      (!property.computed && t.isIdentifier(property.key, { name })))
  );
}
