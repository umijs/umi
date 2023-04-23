import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { winPath } from '@umijs/utils';
import { dirname } from 'path';

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export default function () {
  return {
    post({ path }: any) {
      path.node.body.forEach((node: any) => {
        if (t.isImportDeclaration(node)) {
          if (node.source.value.startsWith('core-js/')) {
            node.source.value = node.source.value.replace(
              /^core-js\//,
              addLastSlash(
                winPath(dirname(require.resolve('core-js/package.json'))),
              ),
            );
          }
        }
      });
    },
  };
}
