import px2rem from 'postcss-plugin-px2rem';
import { join } from 'path';
import findJS from '../../../utils/findJS';

export default function(api) {
  const {
    config: { react = {} },
    paths,
  } = api.service;
  const { winPath } = api.utils;

  if (react.hd) {
    api.register('modifyAFWebpackOpts', ({ memo }) => {
      memo.theme = {
        ...(memo.theme || {}),
        '@hd': '2px',
        ...(react.hd.theme || {}),
      };
      memo.extraPostCSSPlugins = [
        ...(memo.extraPostCSSPlugins || []),
        px2rem({
          rootValue: 100,
          minPixelValue: 2,
          ...(react.hd.px2rem || {}),
        }),
      ];
      return memo;
    });

    api.register('modifyEntryFile', ({ memo }) => {
      const hdJS =
        findJS(paths.absSrcPath, 'hd') ||
        join(__dirname, './template/index.js');
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
}
