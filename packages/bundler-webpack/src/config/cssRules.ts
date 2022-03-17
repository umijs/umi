import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
}

export async function addCSSRules(opts: IOpts) {
  const { config, userConfig } = opts;

  const rulesConfig = [
    { name: 'css', test: /\.css(\?.*)?$/ },
    {
      name: 'less',
      test: /\.less(\?.*)?$/,
      loader: require.resolve('@umijs/bundler-webpack/compiled/less-loader'),
      loaderOptions: {
        implementation: require.resolve('@umijs/bundler-utils/compiled/less'),
        lessOptions: {
          modifyVars: userConfig.theme,
          javascriptEnabled: true,
          ...userConfig.lessLoader,
        },
      },
    },
    {
      name: 'sass',
      test: /\.(sass|scss)(\?.*)?$/,
      loader: require.resolve('@umijs/bundler-webpack/compiled/sass-loader'),
      loaderOptions: userConfig.sassLoader || {},
    },
  ];

  for (const { name, test, loader, loaderOptions } of rulesConfig) {
    const rule = config.module.rule(name);
    const nestRulesConfig = [
      userConfig.autoCSSModules && {
        rule: rule
          .test(test)
          .oneOf('css-modules')
          .resourceQuery(/modules/),
        isCSSModules: true,
      },
      {
        rule: rule.test(test).oneOf('css').sideEffects(true),
        isCSSModules: false,
      },
    ].filter(Boolean);
    // @ts-ignore
    for (const { rule, isCSSModules } of nestRulesConfig) {
      if (userConfig.styleLoader) {
        rule
          .use('style-loader')
          .loader(
            require.resolve('@umijs/bundler-webpack/compiled/style-loader'),
          )
          .options({ base: 0, esModule: true, ...userConfig.styleLoader });
      } else {
        rule
          .use('mini-css-extract-plugin')
          .loader(
            require.resolve(
              '@umijs/bundler-webpack/compiled/mini-css-extract-plugin/loader',
            ),
          )
          .options({
            publicPath: './',
            emit: true,
            esModule: true,
          });
      }

      rule
        .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options({
          importLoaders: 1,
          esModule: true,
          url: true,
          import: true,
          ...(isCSSModules
            ? {
                modules: {
                  localIdentName: '[local]___[hash:base64:5]',
                  ...userConfig.cssLoaderModules,
                },
              }
            : {}),
          ...userConfig.cssLoader,
        });

      rule
        .use('postcss-loader')
        .loader(
          require.resolve('@umijs/bundler-webpack/compiled/postcss-loader'),
        )
        .options({
          postcssOptions: {
            ident: 'postcss',
            plugins: [
              require('@umijs/bundler-webpack/compiled/postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                browsers: opts.browsers,
                autoprefixer: {
                  flexbox: 'no-2009',
                  ...userConfig.autoprefixer,
                },
                stage: 3,
              }),
            ].concat(userConfig.extraPostCSSPlugins || []),
            ...userConfig.postcssLoader,
          },
        });

      if (loader) {
        rule
          .use(loader)
          .loader(typeof loader === 'string' ? require.resolve(loader) : loader)
          .options(loaderOptions || {});
      }
    }
  }
}
