import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function setConfigByName(ast: t.File, name: string, value: any) {
  let _value: any;
  let valueObject: any;
  let isChanged: boolean = false;
  try {
    _value = JSON.parse(value);
  } catch (error) {
    _value = value;
  }
  console.log(_value);
  const valueType = typeof _value;
  switch (valueType) {
    case 'string':
      valueObject = t.stringLiteral(_value);
      break;
    case 'boolean':
      valueObject = t.booleanLiteral(_value);
      break;
    case 'number':
      valueObject = t.numericLiteral(_value);
      break;
    case 'object':
      if (Array.isArray(_value)) {
        valueObject = t.arrayExpression(
          _value.map((i: string) => {
            return t.stringLiteral(i);
          }),
        );
      } else {
        const valueObjs = [] as t.ObjectProperty[];
        Object.keys(_value).forEach((key) => {
          valueObjs.push(
            t.objectProperty(
              t.identifier(key),
              t.stringLiteral(_value[key]),
            ),
          );
        });
        valueObject = t.objectExpression(valueObjs);
      }
      break;
    default:
      console.log(`${valueType} is not supported.`);
      break;
  }
  if (!valueObject) return;
  // 这里是修改逻辑
  traverse.default(ast, {
    ObjectProperty(path) {
      //@ts-ignore
      if (path.node.key?.name === name) {
        path.node.value = valueObject;
        isChanged = true;
      }
    },
  });
  if (!isChanged) {
    // 这里是插入逻辑
    //@ts-ignore
    ast.program.body[0].declaration.properties.push(t.objectProperty(
      t.identifier(name),
      valueObject,
    ))
  }
  return ast;
}
