import { dirname } from 'path';

const coreJSPath = dirname(require.resolve('core-js/package.json'));

export default function() {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (
          state.filename.endsWith('.umi/polyfill.js') ||
          state.filename.endsWith('.umi-production/polyfill.js')
        ) {
          const { node } = path;
          if (node.source.value.startsWith('core-js/')) {
            node.source.value = node.source.value.replace(
              'core-js/',
              `${coreJSPath}/`,
            );
          }
        }
      },
    },
  };
}
