import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyCSSRules(opts: IOpts) {
  const { config, userConfig } = opts;

  const rulesConfig = [
    { name: 'css', test: /\.css(\?.*)?/ },
    {
      name: 'less',
      test: /\.less(\?.*)?/,
      loader: require.resolve('@umijs/bundler-webpack/compiled/less-loader'),
      loaderOptions: {
        implementation: require.resolve('@umijs/bundler-webpack/compiled/less'),
        modifyVars: userConfig.theme,
        javascriptEnabled: true,
        ...userConfig.lessLoader,
      },
    },
    {
      name: 'sass',
      test: /\.(sass|scss)(\?.*)?/,
      loader: require.resolve('@umijs/bundler-webpack/compiled/sass-loader'),
      loaderOptions: userConfig.sassLoader || {},
    },
  ];

  for (const { name, test, loader, loaderOptions } of rulesConfig) {
    const rule = config.module.rule(name).test(test);
    const nestRulesConfig = [
      {
        rule: rule.oneOf('css-modules').resourceQuery(/modules/),
        isCSSModules: true,
      },
      { rule: rule.oneOf('css'), isCSSModules: false },
    ];
    for (const { rule, isCSSModules } of nestRulesConfig) {
      if (userConfig.styleLoader) {
        rule
          .use('style-loader')
          .loader(
            require.resolve('@umijs/bundler-webpack/compiled/sass-loader'),
          )
          .options({ base: 0, esModule: true, ...userConfig.styleLoader });
      } else {
        rule
          .use('mini-css-extract-plugin-loader')
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
        .loader(require.resolve('@umijs/bundler-webpack/compiled/css-loader'))
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

      // TODO: postcss-loader
      // rule
      //   .use('postcss-loader')
      //   .loader(
      //     require.resolve('@umijs/bundler-webpack/compiled/postcss-loader'),
      //   )
      //   .options({});

      if (loader) {
        rule
          .use(loader)
          .loader(typeof loader === 'string' ? require.resolve(loader) : loader)
          .options(loaderOptions || {});
      }
    }
  }
}
