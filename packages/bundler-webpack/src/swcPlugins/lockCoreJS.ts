import type { ImportDeclaration } from '@swc/core';
import Visitor from '@swc/core/Visitor';
import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import { changeImportFromString } from './changeImportFromString';

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

class LockCoreJS extends Visitor {
  visitImportDeclaration(expression: ImportDeclaration): ImportDeclaration {
    const { source } = expression;
    let { value, type } = source;

    if (type === 'StringLiteral' && value.startsWith('core-js/')) {
      const newValue = value.replace(
        /^core-js\//,
        addLastSlash(winPath(dirname(require.resolve('core-js/package.json')))),
      );
      changeImportFromString(expression, newValue);
    }

    return expression;
  }
}

export default LockCoreJS;
