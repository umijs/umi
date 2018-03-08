import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;

  const layoutFiles = [
    join(paths.absSrcPath, 'layouts/index.tsx'),
    join(paths.absSrcPath, 'layouts/index.ts'),
    join(paths.absSrcPath, 'layouts/index.jsx'),
    join(paths.absSrcPath, 'layouts/index.js'),
  ];

  function getLayoutJS() {
    for (const file of layoutFiles) {
      if (existsSync(file)) {
        return file;
      }
    }
  }

  api.register('modifyRouterFile', ({ memo }) => {
    const layoutJS = getLayoutJS();
    if (layoutJS) {
      return memo.replace(
        IMPORT,
        `
import Layout from '${winPath(layoutJS)}';
${IMPORT}
        `.trim(),
      );
    } else {
      return memo;
    }
  });

  api.register('modifyRouterContent', ({ memo }) => {
    const layoutJS = getLayoutJS();
    if (layoutJS) {
      return memo
        .replace('<Switch>', '<Layout><Switch>')
        .replace('</Switch>', '</Switch></Layout>');
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, ...layoutFiles];
  });
}
