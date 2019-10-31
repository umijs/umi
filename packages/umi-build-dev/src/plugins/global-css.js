import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths, winPath } = api;
  const cssFiles = [
    join(paths.absSrcPath, 'global.styl'),
    join(paths.absSrcPath, 'global.stylus'),
    join(paths.absSrcPath, 'global.sass'),
    join(paths.absSrcPath, 'global.scss'),
    join(paths.absSrcPath, 'global.less'),
    join(paths.absSrcPath, 'global.css'),
  ];

  api.addEntryCode(
    `
${cssFiles
      .filter(f => existsSync(f))
      .slice(0, 1)
      .map(f => `require('${winPath(relative(paths.absTmpDirPath, f))}');`)
      .join('')}
    `.trim(),
  );

  api.addPageWatcher(cssFiles);

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      cssModulesExcludes: [...(memo.cssModulesExcludes || []), ...cssFiles],
    };
  });
}
