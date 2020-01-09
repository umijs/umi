import Config from 'webpack-chain';
import { IConfig } from '@umijs/types';
import { deepmerge } from '@umijs/utils';

export function createCSSRule({
  webpackConfig,
  config,
  lang,
  test,
  isDev,
  loader,
  options,
}: {
  webpackConfig: Config;
  config: IConfig;
  lang: string;
  test: RegExp;
  isDev: boolean;
  loader?: string;
  options?: object;
}) {
  const rule = webpackConfig.module.rule(lang).test(test);

  applyLoaders(rule.oneOf('css-modules').resourceQuery(/modules/), true);
  applyLoaders(rule.oneOf('css'), false);

  function applyLoaders(rule: Config.Rule<Config.Rule>, isCSSModules: boolean) {
    if (config.styleLoader) {
      rule
        .use('style-loader')
        .loader(require.resolve('style-loader'))
        .options(
          deepmerge(
            {
              base: 0,
            },
            config.styleLoader,
          ),
        );
    } else {
      rule
        .use('extract-css-loader')
        .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
        .options({
          publicPath: './',
          hmr: isDev,
        });
    }

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options({
        importLoaders: 1,
        sourceMap: false,
        ...(isCSSModules
          ? {
              modules: {
                localIdentName: '[local]___[hash:base64:5]',
              },
            }
          : {}),
      });

    if (loader) {
      rule
        .use(loader)
        .loader(require.resolve(loader))
        .options(options || {});
    }
  }
}
