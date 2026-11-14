import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function getConfigObject(ast: t.File): t.ObjectExpression {
  const declaration = ast.program.body.find((node) =>
    t.isExportDefaultDeclaration(node),
  );
  const config = t.isExportDefaultDeclaration(declaration)
    ? declaration.declaration
    : undefined;
  if (t.isObjectExpression(config)) return config;
  if (
    t.isCallExpression(config) &&
    t.isIdentifier(config.callee, { name: 'defineConfig' }) &&
    t.isObjectExpression(config.arguments[0])
  ) {
    return config.arguments[0];
  }

  throw new Error(
    "Can't modify config file, due to file format. Use export default { ... } or export default defineConfig({ ... }).",
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
