import px2rem from 'postcss-plugin-px2rem';
import { join } from 'path';

export default function(api) {
  const { config, libraryName } = api.service;

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

  if (config.hd) {
    api.register('modifyAFWebpackOpts', ({ memo }) => {
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
      const hdFile = join(__dirname, './template/index.js');
      memo.entry[libraryName].unshift(hdFile);
      return memo;
    });
  }
}
