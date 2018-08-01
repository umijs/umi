import { join } from 'path';
import { existsSync } from 'fs';
import { winPath } from 'umi-utils';

export default function(api) {
  const { paths } = api;

  api.register('modifyEntryFile', ({ memo }) => {
    const cssImports = [
      join(paths.absSrcPath, 'global.css'),
      join(paths.absSrcPath, 'global.less'),
      join(paths.absSrcPath, 'global.sass'),
      join(paths.absSrcPath, 'global.scss'),
    ]
      .filter(f => existsSync(f))
      .map(f => `require('${winPath(f)}');`);

    if (cssImports.length) {
      return `
${memo}
${cssImports.join('\r\n')}
      `.trim();
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      join(paths.absSrcPath, 'global.css'),
      join(paths.absSrcPath, 'global.less'),
      join(paths.absSrcPath, 'global.sass'),
      join(paths.absSrcPath, 'global.scss'),
    ];
  });

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      cssModulesExcludes: [
        ...(memo.cssModulesExcludes || []),
        join(paths.absSrcPath, 'global.css'),
        join(paths.absSrcPath, 'global.less'),
        join(paths.absSrcPath, 'global.scss'),
        join(paths.absSrcPath, 'global.sass'),
      ],
    };
  });
}
