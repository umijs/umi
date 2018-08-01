import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths } = api;
  const cssFiles = [
    join(paths.absSrcPath, 'global.sass'),
    join(paths.absSrcPath, 'global.scss'),
    join(paths.absSrcPath, 'global.less'),
    join(paths.absSrcPath, 'global.css'),
  ];

  api.addEntryImport(() => {
    return cssFiles
      .filter(f => existsSync(f))
      .slice(0, 1)
      .map(f => ({
        source: relative(paths.absTmpDirPath, f),
      }));
  });

  api.addPageWatcher(cssFiles);

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      cssModulesExcludes: [...(memo.cssModulesExcludes || []), ...cssFiles],
    };
  });
}
