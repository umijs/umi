import Config from 'webpack-chain';
import { IConfig } from '@umijs/types';
// @ts-ignore
import safePostCssParser from 'postcss-safe-parser';
import { deepmerge } from '@umijs/utils';

interface IOpts {
  webpackConfig: Config;
  config: IConfig;
  isDev: boolean;
  disableCompress?: boolean;
  browserslist?: any;
  miniCSSExtractPluginPath?: string;
  miniCSSExtractPluginLoaderPath?: string;
}

interface ICreateCSSRuleOpts extends IOpts {
  lang: string;
  test: RegExp;
  loader?: string;
  options?: object;
}

function createCSSRule({
  webpackConfig,
  config,
  lang,
  test,
  isDev,
  loader,
  options,
  browserslist,
  miniCSSExtractPluginLoaderPath,
}: ICreateCSSRuleOpts) {
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
        .loader(
          miniCSSExtractPluginLoaderPath ||
            require.resolve('mini-css-extract-plugin/dist/loader'),
        )
        .options({
          publicPath: './',
          hmr: isDev,
        });
    }

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options(
        deepmerge(
          {
            importLoaders: 1,
            sourceMap: false,
            ...(isCSSModules
              ? {
                  modules: {
                    localIdentName: '[local]___[hash:base64:5]',
                  },
                }
              : {}),
          },
          config.cssLoader || {},
        ),
      );

    rule
      .use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options({
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          // https://github.com/luisrudge/postcss-flexbugs-fixes
          require('postcss-flexbugs-fixes'),
          // https://github.com/csstools/postcss-preset-env
          require('postcss-preset-env')({
            // TODO: set browsers
            autoprefixer: {
              ...config.autoprefixer,
              overrideBrowserslist: browserslist,
            },
            // https://cssdb.org/
            stage: 3,
          }),
          ...(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []),
        ],
      });

    if (loader) {
      rule
        .use(loader)
        .loader(require.resolve(loader))
        .options(options || {});
    }
  }
}

export default function({
  config,
  webpackConfig,
  isDev,
  disableCompress,
  browserslist,
  miniCSSExtractPluginPath,
  miniCSSExtractPluginLoaderPath,
}: IOpts) {
  // css
  createCSSRule({
    webpackConfig,
    config,
    isDev,
    lang: 'css',
    test: /\.(css)(\?.*)?$/,
    browserslist,
    miniCSSExtractPluginLoaderPath,
  });

  // less
  const theme = config.theme;
  createCSSRule({
    webpackConfig,
    config,
    isDev,
    lang: 'less',
    test: /\.(less)(\?.*)?$/,
    loader: 'less-loader',
    options: deepmerge(
      {
        modifyVars: theme,
        javascriptEnabled: true,
      },
      config.lessLoader || {},
    ),
    browserslist,
    miniCSSExtractPluginLoaderPath,
  });

  // extract css
  if (!config.styleLoader) {
    const hash = !isDev && config.hash ? '.[contenthash:8]' : '';
    webpackConfig
      .plugin('extract-css')
      .use(
        miniCSSExtractPluginPath || require.resolve('mini-css-extract-plugin'),
        [
          {
            filename: `[name]${hash}.css`,
            chunkFilename: `[name]${hash}.chunk.css`,
            ignoreOrder: true,
          },
        ],
      );
  }

  if (!isDev && !disableCompress) {
    webpackConfig
      .plugin('optimize-css')
      .use(require.resolve('optimize-css-assets-webpack-plugin'), [
        {
          cssProcessorOptions: {
            // https://github.com/postcss/postcss-safe-parser
            // TODO: 待验证功能
            parser: safePostCssParser,
          },
          cssProcessorPluginOptions: {
            preset: ['default', config.cssnano],
          },
        },
      ]);
  }
}
