import postcss from 'postcss';
import { IConfig } from '../types';
import { getBrowserlist } from './getBrowserlist';

export async function postcssProcess(
  config: IConfig,
  css: string,
  path: string,
) {
  return await postcss(
    [
      require('postcss-flexbugs-fixes'),
      require('postcss-preset-env')({
        browsers: getBrowserlist(config?.targets || {}),
        autoprefixer: {
          flexbox: 'no-2009',
          ...config?.autoprefixer,
        },
        stage: 3,
      }),
    ].concat(config?.extraPostCSSPlugins || []),
  ).process(css, {
    from: path,
    to: path,
  });
}
