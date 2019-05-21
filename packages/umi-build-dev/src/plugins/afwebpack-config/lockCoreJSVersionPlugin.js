import { dirname } from 'path';
import { winPath } from 'umi-utils';

const coreJSPath = dirname(require.resolve('core-js/package.json'));

export default function() {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const filename = winPath(state.filename);
        if (
          filename.endsWith('.umi/polyfills.js') ||
          filename.endsWith('.umi-production/polyfills.js')
        ) {
          const { node } = path;
          if (node.source.value.startsWith('core-js/')) {
            node.source.value = node.source.value.replace('core-js/', `${coreJSPath}/`);
          }
        }
      },
    },
  };
}
