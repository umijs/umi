import { parseExpression } from '@umijs/bundler-utils/compiled/babel/parser';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { getConfigObject, isConfigProperty } from '../utils/getConfigObject';

export function setConfigByName(ast: t.File, name: string, value: string) {
  const config = getConfigObject(ast);
  if (typeof value !== 'string') {
    value = JSON.stringify(value);
  }
  let valueObject: t.Expression = t.stringLiteral(value);
  try {
    JSON.parse(value);
    valueObject = parseExpression(value);
  } catch (error) {}

  const property = config.properties
    .slice()
    .reverse()
    .find((property) => isConfigProperty(property, name));
  if (t.isObjectProperty(property)) {
    property.value = valueObject;
    property.shorthand = false;
  } else if (t.isObjectMethod(property)) {
    const replacement = t.objectProperty(
      property.key,
      valueObject,
      property.computed,
    );
    t.inheritsComments(replacement, property);
    config.properties[config.properties.indexOf(property)] = replacement;
  } else {
    const key = t.isValidIdentifier(name)
      ? t.identifier(name)
      : t.stringLiteral(name);
    config.properties.push(t.objectProperty(key, valueObject));
  }
  return ast;
}
