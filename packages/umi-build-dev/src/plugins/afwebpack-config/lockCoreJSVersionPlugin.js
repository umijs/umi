import { dirname } from 'path';
import { winPath } from 'umi-utils';
import * as types from '@babel/types';

const coreJSPath = dirname(require.resolve('core-js/package.json'));

function isUmiCoreJSPolyfill(oFilename, identifier) {
  const filename = winPath(oFilename);

  return (
    (filename.endsWith('.umi/polyfills.js') || filename.endsWith('.umi-production/polyfills.js')) &&
    identifier.startsWith('core-js/')
  );
}

function getReplacedCoreJSPath(path) {
  return path.replace('core-js/', `${coreJSPath}/`);
}

export default function() {
  return {
    visitor: {
      // handle import statements
      ImportDeclaration(path, state) {
        const callPathNode = path.node;

        if (
          types.isLiteral(callPathNode.source) &&
          isUmiCoreJSPolyfill(state.filename, callPathNode.source.value)
        ) {
          callPathNode.source.value = getReplacedCoreJSPath(callPathNode.source.value);
        }
      },
      // handle require statements
      CallExpression(path, state) {
        const callPathNode = path.node;

        if (
          types.isIdentifier(callPathNode.callee) &&
          callPathNode.callee.name === 'require' &&
          types.isStringLiteral(callPathNode.arguments[0]) &&
          isUmiCoreJSPolyfill(state.filename, callPathNode.arguments[0].value)
        ) {
          callPathNode.arguments[0].value = getReplacedCoreJSPath(callPathNode.arguments[0].value);
        }
      },
    },
  };
}
