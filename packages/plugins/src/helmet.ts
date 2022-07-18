import { Mustache, winPath } from '@umijs/utils';
import type { IApi } from 'umi';

import { dirname } from 'path';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  const helmetPkgPath = winPath(
    dirname(require.resolve('react-helmet-async/package')),
  );

  api.modifyConfig((memo) => {
    // import from react-helmet-async
    memo.alias['react-helmet$'] = helmetPkgPath;
    memo.alias['react-helmet-async$'] = helmetPkgPath;
    return memo;
  });

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'index.ts',
      content: Mustache.render(
        `export { Helmet, HelmetProvider, HelmetData } from '{{{ HelmetPkg }}}';`,
        {
          HelmetPkg: helmetPkgPath,
        },
      ),
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import { HelmetProvider } from '${helmetPkgPath}';

export function rootContainer(container, opts) {
  return React.createElement(HelmetProvider, opts, container);
}
      `,
    });
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });
};
