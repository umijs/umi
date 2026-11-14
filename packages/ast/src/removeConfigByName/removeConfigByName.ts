import type * as t from '@umijs/bundler-utils/compiled/babel/types';
import { getConfigObject, isConfigProperty } from '../utils/getConfigObject';

export function removeConfigByName(ast: t.File, name: string) {
  const config = getConfigObject(ast);
  config.properties = config.properties.filter(
    (property) => !isConfigProperty(property, name),
  );
  return ast;
}
