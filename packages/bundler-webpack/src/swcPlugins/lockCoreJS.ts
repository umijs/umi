import { ImportDeclaration } from '@swc/core';
import Visitor from '@swc/core/Visitor';
import { winPath } from '@umijs/utils';
import { dirname } from 'path';

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

class LockCoreJS extends Visitor {
  visitImportDeclaration(expression: ImportDeclaration): ImportDeclaration {
    const { source } = expression;
    let { value, type } = source;

    if (type === 'StringLiteral' && value.startsWith('core-js/')) {
      value = value.replace(
        /^core-js\//,
        addLastSlash(winPath(dirname(require.resolve('core-js/package.json')))),
      );

      return {
        ...expression,
        source: {
          ...source,
          value,
        },
      };
    }

    return expression;
  }
}

export default LockCoreJS;
