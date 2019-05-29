import px2rem from 'postcss-plugin-px2rem';
import { join, relative } from 'path';

export default function(api, options = {}) {
  const { paths, cwd, findJS } = api;

  function getThemeConfig(theme) {
    // theme may be a string point to file with exported function
    if (typeof theme === 'string') {
      return require(join(cwd, theme))(); // eslint-disable-line
    } else {
      return theme || {};
    }
  }

  api.modifyAFWebpackOpts(opts => {
    opts.theme = {
      ...getThemeConfig(opts.theme),
      '@hd': '2px',
      ...(options.theme || {}),
    };
    opts.extraPostCSSPlugins = [
      ...(opts.extraPostCSSPlugins || []),
      px2rem({
        rootValue: 100,
        minPixelValue: 2,
        ...(options.px2rem || {}),
      }),
    ];
    return opts;
  });

  api.addEntryImport(() => {
    return {
      source: relative(
        paths.absTmpDirPath,
        findJS(paths.absSrcPath, 'hd') || join(__dirname, '../template/index.js'),
      ),
    };
  });

  api.addPageWatcher([
    join(paths.absSrcPath, 'hd.tsx'),
    join(paths.absSrcPath, 'hd.ts'),
    join(paths.absSrcPath, 'hd.jsx'),
    join(paths.absSrcPath, 'hd.js'),
  ]);
}
