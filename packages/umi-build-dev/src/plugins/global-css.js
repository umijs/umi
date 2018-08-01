import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths } = api;
  const cssFiles = [
    join(paths.absSrcPath, 'global.css'),
    join(paths.absSrcPath, 'global.less'),
    join(paths.absSrcPath, 'global.sass'),
    join(paths.absSrcPath, 'global.scss'),
  ];

  api.addEntryImport(() => {
    return cssFiles.filter(f => existsSync(f)).map(f => ({
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
