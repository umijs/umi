import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;
  const layoutPath = join(paths.absSrcPath, 'layouts/index.js');

  api.register('modifyRouterFile', ({ memo }) => {
    if (existsSync(layoutPath)) {
      return memo.replace(
        IMPORT,
        `
import Layout from '${winPath(layoutPath)}';
${IMPORT}
        `.trim(),
      );
    } else {
      return memo;
    }
  });

  api.register('modifyRouterContent', ({ memo }) => {
    if (existsSync(layoutPath)) {
      return memo
        .replace('<Switch>', '<Layout><Switch>')
        .replace('</Switch>', '</Switch></Layout>');
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, join(paths.absSrcPath, 'layouts/index.js')];
  });
}
