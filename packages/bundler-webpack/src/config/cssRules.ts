import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { winPath } from '@umijs/utils';
import type { LoaderContext } from 'mini-css-extract-plugin/types/utils';
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
    {
      name: 'stylus',
      test: /\.(styl|stylus)(\?.*)?$/,
      loader: require.resolve('@umijs/bundler-webpack/compiled/stylus-loader'),
      loaderOptions: userConfig.stylusLoader || {},
    },
  ];

  const cssPublicPath = userConfig.cssPublicPath || './';

  for (const { name, test, loader, loaderOptions } of rulesConfig) {
    const rule = config.module.rule(name);
    const nestRulesConfig = [
      userConfig.autoCSSModules && {
        rule: rule
          .test(test)
          .oneOf('css-modules')
          .resourceQuery(/modules/),
        isAutoCSSModuleRule: true,
      },
      {
        rule: rule.test(test).oneOf('css').sideEffects(true),
        isAutoCSSModuleRule: false,
      },
    ].filter(Boolean);
    // @ts-ignore
    for (const { rule, isAutoCSSModuleRule } of nestRulesConfig) {
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
            publicPath: cssPublicPath,
            emit: true,
            esModule: true,
          });
      }

      // If SSR with bundler esbuild is enabled, we need to handling the css modules name hashing
      // and save the class names mapping into opts.cssModulesMapping
      // so the esbuild can use it to generate the correct name for the server side
      const getLocalIdent =
        userConfig.ssr && userConfig.ssr.compiler === 'esbuild'
          ? getLocalIdentForSSR
          : undefined;
      const localIdentName = '[local]___[hash:base64:5]';

      let cssLoaderModulesConfig: any;
      if (isAutoCSSModuleRule) {
        cssLoaderModulesConfig = {
          localIdentName,
          ...userConfig.cssLoaderModules,
          getLocalIdent,
        };
      } else if (userConfig.normalCSSLoaderModules) {
        cssLoaderModulesConfig = {
          localIdentName,
          auto: true,
          ...userConfig.normalCSSLoaderModules,
          getLocalIdent,
        };
      }

      rule
        .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options({
          importLoaders: 1,
          esModule: true,
          url: {
            filter: (url: string) => {
              // Don't parse absolute URLs
              // ref: https://github.com/webpack-contrib/css-loader#url
              if (url.startsWith('/')) return false;
              return true;
            },
          },
          import: true,
          modules: cssLoaderModulesConfig,
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
          .use(`${name}-loader`)
          .loader(loader)
          .options(loaderOptions || {});
      }
    }
  }
}

function ensureLastSlash(path: string) {
  return path.endsWith('/') ? path : path + '/';
}

function getLocalIdentForSSR(
  context: LoaderContext,
  localIdentName: string,
  localName: string,
  opt: any,
) {
  const classIdent = (
    winPath(context.resourcePath).replace(
      winPath(ensureLastSlash(opt.context)),
      '',
    ) +
    '@' +
    localName
  ).trim();
  let hash = Buffer.from(classIdent).toString('base64').replace(/=/g, '');
  hash = hash.substring(hash.length - 5);
  const result = localIdentName
    .replace(/\[local]/g, localName)
    .replace(/\[hash[^\[]*?]/g, hash);
  return result;
}
