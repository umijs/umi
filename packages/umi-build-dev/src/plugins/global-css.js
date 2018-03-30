import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;

  api.register('modifyRouterFile', ({ memo }) => {
    const cssImports = [
      join(paths.absSrcPath, 'global.css'),
      join(paths.absSrcPath, 'global.less'),
    ]
      .filter(f => existsSync(f))
      .map(f => `require('${winPath(f)}');`);

    if (cssImports.length) {
      return memo.replace(
        IMPORT,
        `
${cssImports.join('\r\n')}
${IMPORT}
          `.trim(),
      );
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      join(paths.absSrcPath, 'global.css'),
      join(paths.absSrcPath, 'global.less'),
    ];
  });
}
