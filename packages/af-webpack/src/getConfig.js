import webpack from 'webpack';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import SystemBellWebpackPlugin from 'system-bell-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import autoprefixer from 'autoprefixer';
import { dirname, resolve, join, extname } from 'path';
import { existsSync } from 'fs';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import assert from 'assert';
import deprecate from 'deprecate';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import ProgressPlugin from 'progress-bar-webpack-plugin';
import { sync as resolveSync } from 'resolve';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import uglifyJSConfig from './defaultConfigs/uglifyJS';
import babelConfig from './defaultConfigs/babel';
import defaultBrowsers from './defaultConfigs/browsers';
import stringifyObject from './stringifyObject';
import normalizeTheme from './normalizeTheme';
import { applyWebpackConfig } from './applyWebpackConfig';
import readRc from './readRc';
import { stripLastSlash } from './utils';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';

const { TsConfigPathsPlugin } = require('awesome-typescript-loader'); // eslint-disable-line
const debug = require('debug')('af-webpack:getConfig');

if (process.env.DISABLE_TSLINT) {
  deprecate('DISABLE_TSLINT is deprecated, use TSLINT=none instead');
}
if (process.env.DISABLE_ESLINT) {
  deprecate('DISABLE_ESLINT is deprecated, use ESLINT=none instead');
}
if (process.env.NO_COMPRESS) {
  deprecate('NO_COMPRESS is deprecated, use COMPRESS=none instead');
}

export default function getConfig(opts = {}) {
  assert(opts.cwd, 'opts.cwd must be specified');

  const isDev = process.env.NODE_ENV === 'development';
  const theme = normalizeTheme(opts.theme);
  const postcssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebookincubator/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'), // eslint-disable-line
      autoprefixer({
        browsers: opts.browserslist || defaultBrowsers,
        flexbox: 'no-2009',
      }),
      ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : []),
    ],
  };
  const cssModulesConfig = {
    modules: true,
    localIdentName: isDev
      ? '[name]__[local]___[hash:base64:5]'
      : '[local]___[hash:base64:5]',
  };
  const lessOptions = {
    modifyVars: theme,
    ...(opts.lessLoaderOptions || {}),
  };
  const cssOptions = {
    importLoaders: 1,
    ...(isDev
      ? {}
      : {
          minimize: !(
            process.env.CSS_COMPRESS === 'none' ||
            process.env.COMPRESS === 'none' ||
            process.env.NO_COMPRESS
          )
            ? {
                // ref: https://github.com/umijs/umi/issues/164
                minifyFontValues: false,
              }
            : false,
          sourceMap: !opts.disableCSSSourceMap,
        }),
    ...(opts.cssLoaderOptions || {}),
  };

  function getCSSLoader(opts = {}) {
    const { cssModules, less, sass, sassOptions } = opts;

    let hasSassLoader = true;
    try {
      require.resolve('sass-loader');
    } catch (e) {
      hasSassLoader = false;
    }

    return [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          ...cssOptions,
          ...(cssModules ? cssModulesConfig : {}),
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: postcssOptions,
      },
      ...(less
        ? [
            {
              loader: require.resolve('less-loader'),
              options: lessOptions,
            },
          ]
        : []),
      ...(sass && hasSassLoader
        ? [
            {
              loader: require.resolve('sass-loader'),
              options: sassOptions,
            },
          ]
        : []),
    ];
  }

  function exclude(filePath) {
    if (/node_modules/.test(filePath)) {
      return true;
    }
    if (opts.cssModulesWithAffix) {
      if (/\.module\.(css|less|sass|scss)$/.test(filePath)) return true;
    }
    if (opts.cssModulesExcludes) {
      for (const exclude of opts.cssModulesExcludes) {
        if (filePath.indexOf(exclude) > -1) return true;
      }
    }
  }

  const cssRules = [
    ...(opts.cssModulesExcludes
      ? opts.cssModulesExcludes.map(file => {
          return {
            test(filePath) {
              return filePath.indexOf(file) > -1;
            },
            use: getCSSLoader({
              less: extname(file).toLowerCase() === '.less',
              sass:
                extname(file).toLowerCase() === '.sass' ||
                extname(file).toLowerCase() === '.scss',
              sassOptions: opts.sass,
            }),
          };
        })
      : []),
    ...(opts.cssModulesWithAffix
      ? [
          {
            test: /\.module\.css$/,
            use: getCSSLoader({
              cssModules: true,
            }),
          },
          {
            test: /\.module\.less$/,
            use: getCSSLoader({
              cssModules: true,
              less: true,
            }),
          },
          {
            test: /\.module\.(sass|scss)$/,
            use: getCSSLoader({
              cssModules: true,
              sass: true,
              sassOptions: opts.sass,
            }),
          },
        ]
      : []),
    {
      test: /\.css$/,
      exclude,
      use: getCSSLoader({
        cssModules: !opts.disableCSSModules,
      }),
    },
    {
      test: /\.css$/,
      include: /node_modules/,
      use: getCSSLoader(),
    },
    {
      test: /\.less$/,
      exclude,
      use: getCSSLoader({
        cssModules: !opts.disableCSSModules,
        less: true,
      }),
    },
    {
      test: /\.less$/,
      include: /node_modules/,
      use: getCSSLoader({
        less: true,
      }),
    },
    {
      test: /\.(sass|scss)$/,
      exclude,
      use: getCSSLoader({
        cssModules: !opts.disableCSSModules,
        sass: true,
        sassOptions: opts.sass,
      }),
    },
    {
      test: /\.(sass|scss)$/,
      include: /node_modules/,
      use: getCSSLoader({
        sass: true,
        sassOptions: opts.sass,
      }),
    },
  ];

  // 生成环境下用 ExtractTextPlugin 提取出来
  if (!isDev) {
    cssRules.forEach(rule => {
      rule.use = ExtractTextPlugin.extract({
        use: rule.use.slice(1),
      });
    });
  }

  // TODO: 根据 opts.hash 自动处理这里的 filename
  const commonsPlugins = (opts.commons || []).map(common => {
    return new webpack.optimize.CommonsChunkPlugin(common);
  });

  // Declare outputPath here for reuse
  const outputPath = opts.outputPath
    ? resolve(opts.cwd, opts.outputPath)
    : resolve(opts.cwd, 'dist');

  // Copy files in public to outputPath
  const copyPlugins = opts.copy ? [new CopyWebpackPlugin(opts.copy)] : [];
  if (existsSync(resolve(opts.cwd, 'public'))) {
    copyPlugins.push(
      new CopyWebpackPlugin(
        [
          {
            from: resolve(opts.cwd, 'public'),
            to: outputPath,
            toType: 'dir',
          },
        ],
        { ignore: ['**/.*'] },
      ),
    );
  }

  // js 和 css 采用不同的 hash 算法
  const jsHash = !isDev && opts.hash ? '.[chunkhash:8]' : '';
  const cssHash = !isDev && opts.hash ? '.[contenthash:8]' : '';

  const babelOptions = {
    ...(opts.babel || babelConfig),
    cacheDirectory: process.env.BABEL_CACHE !== 'none',
    babelrc: !!process.env.BABELRC,
  };
  babelOptions.plugins = [
    ...(babelOptions.plugins || []),
    ...(opts.disableDynamicImport
      ? [require.resolve('babel-plugin-dynamic-import-node-sync')]
      : []),
  ];
  const babelUse = [
    {
      loader: require('path').join(__dirname, 'debugLoader.js'), // eslint-disable-line
    },
    {
      loader: require.resolve('babel-loader'),
      options: babelOptions,
    },
  ];
  const babelOptionsDeps = {
    presets: [
      [
        require.resolve('babel-preset-umi'),
        {
          disableTransform: true,
        },
      ],
    ],
    cacheDirectory: process.env.BABEL_CACHE !== 'none',
    babelrc: !!process.env.BABELRC,
  };
  const babelUseDeps = [
    {
      loader: require('path').join(__dirname, 'debugLoader.js'), // eslint-disable-line
    },
    {
      loader: require.resolve('babel-loader'),
      options: babelOptionsDeps,
    },
  ];

  const eslintOptions = {
    formatter: eslintFormatter,
    baseConfig: {
      extends: [require.resolve('eslint-config-umi')],
    },
    ignore: false,
    eslintPath: require.resolve('eslint'),
    useEslintrc: false,
  };

  // 用用户的 eslint
  try {
    const { dependencies, devDependencies } = require(resolve('package.json')); // eslint-disable-line
    if (dependencies.eslint || devDependencies.eslint) {
      const eslintPath = resolveSync('eslint', {
        basedir: opts.cwd,
      });
      eslintOptions.eslintPath = eslintPath;
      debug(`use user's eslint bin: ${eslintPath}`);
    }
  } catch (e) {
    // do nothing
  }

  // 读用户的 eslintrc
  const userEslintRulePath = resolve(opts.cwd, '.eslintrc');
  if (existsSync(userEslintRulePath)) {
    try {
      const userRc = readRc(userEslintRulePath);
      debug(`userRc: ${JSON.stringify(userRc)}`);
      if (userRc.extends) {
        debug(`use user's .eslintrc: ${userEslintRulePath}`);
        eslintOptions.useEslintrc = true;
        eslintOptions.baseConfig = false;
        eslintOptions.ignore = true;
      } else {
        debug(`extend with user's .eslintrc: ${userEslintRulePath}`);
        eslintOptions.baseConfig = {
          ...eslintOptions.baseConfig,
          ...userRc,
        };
      }
    } catch (e) {
      debug(e);
    }
  }

  const extraBabelIncludes = opts.extraBabelIncludes || [];
  if (opts.es5ImcompatibleVersions) {
    extraBabelIncludes.push(a => {
      if (a.indexOf('node_modules') === -1) return false;
      const pkgPath = getPkgPath(a);
      return shouldTransform(pkgPath);
    });
  }

  const config = {
    bail: !isDev,
    devtool: opts.devtool || undefined,
    entry: opts.entry || null,
    output: {
      path: outputPath,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isDev,
      filename: `[name]${jsHash}.js`,
      publicPath: opts.publicPath || undefined,
      chunkFilename: `[name]${jsHash}.async.js`,
    },
    resolve: {
      modules: [
        'node_modules',
        resolve(__dirname, '../node_modules'),
        ...(opts.extraResolveModules || []),
      ],
      extensions: [
        ...(opts.extraResolveExtensions || []),
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.js',
        '.json',
        '.jsx',
        '.ts',
        '.tsx',
      ],
      alias: {
        '@babel/runtime': dirname(
          require.resolve('@babel/runtime/package.json'),
        ),
        ...opts.alias,
      },
      plugins:
        process.env.TS_CONFIG_PATHS_PLUGIN &&
        process.env.TS_CONFIG_PATHS_PLUGIN !== 'none'
          ? [new TsConfigPathsPlugin()]
          : [],
    },
    module: {
      rules: [
        ...(process.env.DISABLE_TSLINT || process.env.TSLINT === 'none'
          ? []
          : [
              {
                test: /\.tsx?$/,
                include: opts.cwd,
                exclude: /node_modules/,
                enforce: 'pre',
                use: [
                  {
                    options: {
                      emitErrors: true,
                      // formatter: eslintFormatter,
                    },
                    loader: require.resolve('tslint-loader'),
                  },
                ],
              },
            ]),
        ...(process.env.DISABLE_ESLINT || process.env.ESLINT === 'none'
          ? []
          : [
              {
                test: /\.(js|jsx)$/,
                include: opts.cwd,
                exclude: /node_modules/,
                enforce: 'pre',
                use: [
                  {
                    options: eslintOptions,
                    loader: require.resolve('eslint-loader'),
                  },
                ],
              },
            ]),
        {
          exclude: [
            /\.(html|ejs)$/,
            /\.json$/,
            /\.(js|jsx|ts|tsx)$/,
            /\.(css|less|scss|sass)$/,
            ...(opts.urlLoaderExcludes || []),
          ],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.js$/,
          include: opts.cwd,
          exclude: /node_modules/,
          use: babelUse,
        },
        {
          test: /\.jsx$/,
          include: opts.cwd,
          use: babelUse,
        },
        {
          test: /\.(ts|tsx)$/,
          include: opts.cwd,
          exclude: /node_modules/,
          use: [
            ...babelUse,
            {
              loader: require.resolve('awesome-typescript-loader'),
              options: {
                configFileName:
                  opts.tsConfigFile || join(opts.cwd, 'tsconfig.json'),
                transpileOnly: true,
                ...(opts.typescript || {}),
              },
            },
          ],
        },
        ...extraBabelIncludes.map(include => {
          return {
            test: /\.(js|jsx)$/,
            include:
              typeof include === 'string' ? join(opts.cwd, include) : include,
            use: babelUseDeps,
          };
        }),
        {
          test: /\.html$/,
          loader: require.resolve('file-loader'),
          options: {
            name: '[name].[ext]',
          },
        },
        ...cssRules,
      ],
    },
    plugins: [
      ...(isDev
        ? [
            new webpack.HotModuleReplacementPlugin(),
            // Disable this plugin since it causes 100% cpu when have lost deps
            // new WatchMissingNodeModulesPlugin(join(opts.cwd, 'node_modules')),
            new SystemBellWebpackPlugin(),
            ...(process.env.HARD_SOURCE && process.env.HARD_SOURCE !== 'none'
              ? [new HardSourceWebpackPlugin()]
              : []),
          ].concat(
            opts.devtool
              ? []
              : [
                  new webpack.SourceMapDevToolPlugin({
                    columns: false,
                    moduleFilenameTemplate: info => {
                      if (
                        /\/koi-pkgs\/packages/.test(
                          info.absoluteResourcePath,
                        ) ||
                        /packages\/koi-core/.test(info.absoluteResourcePath) ||
                        /webpack\/bootstrap/.test(info.absoluteResourcePath) ||
                        /\/node_modules\//.test(info.absoluteResourcePath)
                      ) {
                        return `internal:///${info.absoluteResourcePath}`;
                      }
                      return resolve(info.absoluteResourcePath).replace(
                        /\\/g,
                        '/',
                      );
                    },
                  }),
                ],
          )
        : [
            ...(process.env.__FROM_TEST
              ? []
              : [new webpack.HashedModuleIdsPlugin()]),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new ExtractTextPlugin({
              filename: `[name]${cssHash}.css`,
              allChunks: true,
            }),
            ...(opts.serviceworker
              ? [
                  new SWPrecacheWebpackPlugin({
                    filename: 'service-worker.js',
                    minify: !(
                      process.env.NO_COMPRESS || process.env.COMPRESS === 'none'
                    ),
                    staticFileGlobsIgnorePatterns: [
                      /\.map$/,
                      /asset-manifest\.json$/,
                    ],
                    ...opts.serviceworker,
                  }),
                ]
              : []),
            ...(opts.manifest
              ? [
                  new ManifestPlugin({
                    fileName: 'manifest.json',
                    ...opts.manifest,
                  }),
                ]
              : []),
          ]),
      ...(isDev || (process.env.NO_COMPRESS || process.env.COMPRESS === 'none')
        ? []
        : [
            new webpack.optimize.UglifyJsPlugin({
              ...uglifyJSConfig,
              ...(opts.devtool ? { sourceMap: true } : {}),
            }),
          ]),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          // eslint-disable-line
          isDev ? 'development' : 'production',
        ), // eslint-disable-line
        'process.env.HMR': process.env.HMR,
        // 给 socket server 用
        ...(process.env.SOCKET_SERVER
          ? {
              'process.env.SOCKET_SERVER': JSON.stringify(
                process.env.SOCKET_SERVER,
              ),
            }
          : {}),
        ...stringifyObject(opts.define || {}),
      }),
      ...(opts.html ? [new HTMLWebpackPlugin(opts.html)] : []),
      new CaseSensitivePathsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
        },
      }),
      new ProgressPlugin(),
      ...(process.env.TS_TYPECHECK ? [new ForkTsCheckerWebpackPlugin()] : []),
      ...(opts.ignoreMomentLocale
        ? [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]
        : []),
      ...commonsPlugins,
      ...copyPlugins,
      ...(process.env.ANALYZE
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'server',
              analyzerPort: process.env.ANALYZE_PORT || 8888,
              openAnalyzer: true,
            }),
          ]
        : []),
    ],
    externals: opts.externals,
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    performance: isDev
      ? {
          hints: false,
        }
      : {},
  };

  if (process.env.PUBLIC_PATH) {
    config.output.publicPath = `${stripLastSlash(process.env.PUBLIC_PATH)}/`;
  }

  return applyWebpackConfig(opts.cwd, config);
}
