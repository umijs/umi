import { join, relative } from 'path';
import { existsSync } from 'fs';

const GLOBAL_CSS_ENTRY = 'umi-global-css';

export default function(api) {
  const { paths, winPath } = api;
  const cssFiles = [
    join(paths.absSrcPath, 'global.sass'),
    join(paths.absSrcPath, 'global.scss'),
    join(paths.absSrcPath, 'global.less'),
    join(paths.absSrcPath, 'global.css'),
  ];

  api.addPageWatcher(cssFiles);

  api.modifyHTMLWithAST(html => {
    return html(
      `<link rel="stylesheet" href="/${GLOBAL_CSS_ENTRY}.css">`,
    ).appendTo('body');
  });

  api.modifyAFWebpackOpts(memo => {
    return {
      ...memo,
      entry: {
        ...(memo.entry || {}),
        [GLOBAL_CSS_ENTRY]: cssFiles.filter(f => existsSync(f)).slice(0, 1),
      },
      cssModulesExcludes: [...(memo.cssModulesExcludes || []), ...cssFiles],
    };
  });
}
