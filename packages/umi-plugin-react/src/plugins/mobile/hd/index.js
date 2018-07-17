import px2rem from 'postcss-plugin-px2rem';
import { join } from 'path';
import { findJS, winPath } from 'umi-utils';

export default function(api, options) {
  const { paths } = api.service;

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.theme = {
      ...(memo.theme || {}),
      '@hd': '2px',
      ...(options.theme || {}),
    };
    memo.extraPostCSSPlugins = [
      ...(memo.extraPostCSSPlugins || []),
      px2rem({
        rootValue: 100,
        minPixelValue: 2,
        ...(options.px2rem || {}),
      }),
    ];
    return memo;
  });

  api.register('modifyEntryFile', ({ memo }) => {
    const hdJS =
      findJS(paths.absSrcPath, 'hd') || join(__dirname, './template/index.js');
    if (hdJS) {
      memo = `
import '${winPath(hdJS)}';
${memo}
      `.trim();
    }
    return memo;
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    memo = [
      ...memo,
      join(paths.absSrcPath, 'hd.tsx'),
      join(paths.absSrcPath, 'hd.ts'),
      join(paths.absSrcPath, 'hd.jsx'),
      join(paths.absSrcPath, 'hd.js'),
    ];
    return memo;
  });
}
