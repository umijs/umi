import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths, winPath } = api;
  const cssFiles = [
    join(paths.absSrcPath, 'global.css'),
    join(paths.absSrcPath, 'global.less'),
    join(paths.absSrcPath, 'global.sass'),
    join(paths.absSrcPath, 'global.scss'),
  ];

  api.register('modifyEntryFile', ({ memo }) => {
    const cssImports = cssFiles
      .filter(f => existsSync(f))
      .map(f => `require('${winPath(relative(paths.absTmpDirPath, f))}');`);
    if (cssImports.length) {
      return `
${memo}
${cssImports.join('\r\n')}
      `.trim();
    } else {
      return memo;
    }
  });

  api.addPageWatcher(cssFiles);

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      cssModulesExcludes: [...(memo.cssModulesExcludes || []), ...cssFiles],
    };
  });
}
