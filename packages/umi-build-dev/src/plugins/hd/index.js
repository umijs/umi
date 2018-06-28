import px2rem from 'postcss-plugin-px2rem';
import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { config, paths } = api.service;
  const { winPath } = api.utils;

  const hdFiles = [
    join(paths.absSrcPath, 'hd.tsx'),
    join(paths.absSrcPath, 'hd.ts'),
    join(paths.absSrcPath, 'hd.jsx'),
    join(paths.absSrcPath, 'hd.js'),
  ];

  function getHdJS() {
    for (const file of hdFiles) {
      if (existsSync(file)) {
        return file;
      }
    }
    return join(__dirname, './template/index.js');
  }

  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'hd',
        onChange() {
          api.service.restart(/* why */ 'Config hd Changed');
        },
      };
    });
    return memo;
  });

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    if (config.hd) {
      memo.theme = {
        ...(memo.theme || {}),
        '@hd': '2px',
      };
      memo.extraPostCSSPlugins = [
        ...(memo.extraPostCSSPlugins || []),
        px2rem({
          rootValue: 100,
          minPixelValue: 2,
        }),
      ];
    }
    return memo;
  });

  api.register('modifyEntryFile', ({ memo }) => {
    if (config.hd) {
      const hdJS = getHdJS();
      if (hdJS) {
        memo = `import '${winPath(hdJS)}';\r\n${memo}`;
      }
    }
    return memo;
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    if (config.hd) {
      memo = [...memo, ...hdFiles];
    }
    return memo;
  });
}
