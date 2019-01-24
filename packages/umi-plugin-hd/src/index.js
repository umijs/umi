import px2rem from 'postcss-plugin-px2rem';
import { join, relative } from 'path';

export default function(api, options = {}) {
  const { paths, findJS } = api;

  api.modifyAFWebpackOpts(opts => {
    opts.theme = {
      ...(opts.theme || {}),
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
        findJS(paths.absSrcPath, 'hd') ||
          join(__dirname, '../template/index.js'),
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
