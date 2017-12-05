import webpack from 'webpack';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import SystemBellWebpackPlugin from 'system-bell-webpack-plugin';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import { dirname, resolve, join } from 'path';
import { existsSync } from 'fs';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { sync as resolveSync } from 'resolve';
import uglifyJSConfig from './defaultConfigs/uglifyJS';
import babelConfig from './defaultConfigs/babel';
import browsersConfig from './defaultConfigs/browsers';
import stringifyObject from './stringifyObject';
import normalizeTheme from './normalizeTheme';
import { applyWebpackConfig } from './applyWebpackConfig';

const debug = require('debug')('af-webpack:getConfig');

// opts 包含：
// - cwd
// - browsers
// - extraPostCSSPlugins
// - disableCSSModules
// - theme
// - babel
// - noCompress
// - define
// - alias
// - outputPath
// - publicPath
// - entry
// - extraResolveModules
// - commons
// - hash
// - externals
// - extraBabelIncludes
// - extraResolveExtensions
// - ignoreMomentLocale
// - copy
// - disableCSSSourceMap
// - sass
// - devtool

function invalidProp(obj, prop) {
  return !(prop in obj) || obj[prop] === undefined;
}

export default function getConfig(opts = {}) {
  assert(opts.cwd, 'opts.cwd must be specified');
  assert(opts.outputPath, 'opts.outputPath must be specified');
  assert(
    invalidProp(opts, 'browsers') || Array.isArray(opts.browsers),
    `opts.browsers must be Array, but got ${opts.browsers}`,
  );
  assert(
    invalidProp(opts, 'extraPostCSSPlugins') ||
      Array.isArray(opts.extraPostCSSPlugins),
    `opts.extraPostCSSPlugins must be Array, but got ${
      opts.extraPostCSSPlugins
    }`,
  );
  assert(
    invalidProp(opts, 'theme') ||
      (isPlainObject(opts.theme) || typeof opts.theme === 'string'),
    `opts.theme must be Object or String, but got ${opts.theme}`,
  );
  assert(
    invalidProp(opts, 'babel') || isPlainObject(opts.babel),
    `opts.babel must be Object, but got ${opts.babel}`,
  );
  assert(
    invalidProp(opts, 'disableCSSModules') ||
      typeof opts.disableCSSModules === 'boolean',
    `opts.disableCSSModules must be Boolean, but got ${opts.disableCSSModules}`,
  );
  assert(
    invalidProp(opts, 'noCompress') || typeof opts.noCompress === 'boolean',
    `opts.noCompress must be Boolean, but got ${opts.noCompress}`,
  );
  assert(
    invalidProp(opts, 'define') || isPlainObject(opts.define),
    `opts.define must be Object, but got ${opts.define}`,
  );
  assert(
    invalidProp(opts, 'publicPath') || typeof opts.publicPath === 'string',
    `opts.publicPath must be String, but got ${opts.publicPath}`,
  );
  assert(
    invalidProp(opts, 'alias') || isPlainObject(opts.alias),
    `opts.alias must be Boolean, but got ${opts.alias}`,
  );
  assert(
    invalidProp(opts, 'outputPath') || typeof opts.outputPath === 'string',
    `opts.outputPath must be String, but got ${opts.outputPath}`,
  );
  assert(
    invalidProp(opts, 'entry') ||
      (typeof opts.entry === 'string' || isPlainObject(opts.entry)),
    `opts.entry must be String or PlainObject, but got ${opts.entry}`,
  );
  assert(
    invalidProp(opts, 'extraResolveModules') ||
      Array.isArray(opts.extraResolveModules),
    `opts.extraResolveModules must be Array, but got ${
      opts.extraResolveModules
    }`,
  );
  assert(
    invalidProp(opts, 'commons') || Array.isArray(opts.commons),
    `opts.commons must be Array, but got ${opts.commons}`,
  );
  assert(
    invalidProp(opts, 'hash') || typeof opts.hash === 'boolean',
    `opts.hash must be Boolean, but got ${opts.hash}`,
  );
  assert(
    invalidProp(opts, 'extraBabelIncludes') ||
      Array.isArray(opts.extraBabelIncludes),
    `opts.extraBabelIncludes must be Array, but got ${opts.extraBabelIncludes}`,
  );
  assert(
    invalidProp(opts, 'extraResolveExtensions') ||
      Array.isArray(opts.extraResolveExtensions),
    `opts.extraResolveExtensions must be Array, but got ${
      opts.extraResolveExtensions
    }`,
  );
  assert(
    invalidProp(opts, 'copy') || Array.isArray(opts.copy),
    `opts.copy must be Array, but got ${opts.copy}`,
  );
  assert(
    invalidProp(opts, 'ignoreMomentLocale') ||
      typeof opts.ignoreMomentLocale === 'boolean',
    `opts.ignoreMomentLocale must be Boolean, but got ${
      opts.ignoreMomentLocale
    }`,
  );
  assert(
    invalidProp(opts, 'disableCSSSourceMap') ||
      typeof opts.disableCSSSourceMap === 'boolean',
    `opts.disableCSSSourceMap must be Boolean, but got ${
      opts.disableCSSSourceMap
    }`,
  );
  assert(
    invalidProp(opts, 'sass') || isPlainObject(opts.theme),
    `opts.sass must be Object, but got ${opts.sass}`,
  );
  assert(
    invalidProp(opts, 'devtool') || typeof opts.theme === 'string',
    `opts.devtool must be String, but got ${opts.devtool}`,
  );

  const isDev = process.env.NODE_ENV === 'development';
  const theme = normalizeTheme(opts.theme);
  const postcssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebookincubator/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        browsers: opts.browsers || browsersConfig,
        flexbox: 'no-2009',
      }),
      ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : []),
    ],
  };
  const cssModulesConfig = opts.disableCSSModules
    ? {}
    : {
        modules: true,
        localIdentName: '[local]___[hash:base64:5]',
      };
  const lessOptions = {
    modifyVars: theme,
  };
  const cssOptions = {
    importLoaders: 1,
    ...(isDev
      ? {}
      : {
          minimize: !process.env.NO_COMPRESS,
          sourceMap: !opts.disableCSSSourceMap,
        }),
  };

  function getCSSLoader(opts = {}) {
    const { cssModules, less, sass, sassOptions } = opts;
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
      ...(sass
        ? [
            {
              loader: require.resolve('sass-loader'),
              options: sassOptions,
            },
          ]
        : []),
    ];
  }

  const cssRules = [
    {
      test: /\.css$/,
      exclude: /node_modules/,
      use: getCSSLoader({
        cssModules: true,
      }),
    },
    {
      test: /\.css$/,
      include: /node_modules/,
      use: getCSSLoader(),
    },
    {
      test: /\.less$/,
      exclude: /node_modules/,
      use: getCSSLoader({
        cssModules: true,
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
      exclude: /node_modules/,
      use: getCSSLoader({
        cssModules: true,
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

  const copyPlugins = opts.copy ? [new CopyWebpackPlugin(opts.copy)] : [];

  // js 和 css 采用不同的 hash 算法
  const jsHash = opts.hash ? '.[chunkhash:8]' : '';
  const cssHash = opts.hash ? '.[contenthash:8]' : '';

  const babelUse = [
    {
      loader: require('path').join(__dirname, 'debugLoader.js'),
    },
    {
      loader: require.resolve('babel-loader'),
      options: {
        ...(opts.babel || babelConfig),
        // 性能提升有限，但会带来一系列答疑的工作量，所以不开放
        cacheDirectory: false,
      },
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
    if (dependencies.eslint || devDependencies) {
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
  if (existsSync(resolve('.eslintrc'))) {
    debug(`use user's .eslintrc: ${resolve('.eslintrc')}`);
    eslintOptions.useEslintrc = true;
    eslintOptions.baseConfig = false;
    eslintOptions.ignore = true;
  }

  const config = {
    bail: !isDev,
    devtool: opts.devtool || undefined,
    entry: opts.entry || null,
    output: {
      path: opts.outputPath || null,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isDev,
      filename: `[name]${jsHash}.js`,
      publicPath: opts.publicPath || undefined,
      chunkFilename: `[name]${jsHash}.async.js`,
    },
    resolve: {
      modules: [
        resolve(__dirname, '../node_modules'),
        'node_modules',
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
        '@babel/runtime': dirname(require.resolve('@babel/runtime/package')),
        ...opts.alias,
      },
    },
    module: {
      rules: [
        ...(process.env.DISABLE_ESLINT
          ? []
          : [
              {
                test: /\.(js|jsx)$/,
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
            /\.html$/,
            /\.json$/,
            /\.(js|jsx|ts|tsx)$/,
            /\.(css|less|scss)$/,
          ],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: babelUse,
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            ...babelUse,
            {
              loader: 'awesome-typescript-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        ...(opts.extraBabelIncludes
          ? opts.extraBabelIncludes.map(include => {
              return {
                test: /\.(js|jsx)$/,
                include: join(opts.cwd, include),
                use: babelUse,
              };
            })
          : []),
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
            new WatchMissingNodeModulesPlugin(join(opts.cwd, 'node_modules')),
            new SystemBellWebpackPlugin(),
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
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new ExtractTextPlugin({
              filename: `[name]${cssHash}.css`,
              allChunks: true,
            }),
          ]),
      ...(isDev || process.env.NO_COMPRESS
        ? []
        : [new webpack.optimize.UglifyJsPlugin(uglifyJSConfig)]),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          // eslint-disable-line
          isDev ? 'development' : 'production',
        ), // eslint-disable-line
        ...stringifyObject(opts.define || {}),
      }),
      ...(process.env.ANALYZE
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'server',
              analyzerPort: process.env.ANALYZE_PORT || 8888,
              openAnalyzer: true,
            }),
          ]
        : []),
      new CaseSensitivePathsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
        },
      }),
      ...(opts.ignoreMomentLocale
        ? [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]
        : []),
      ...commonsPlugins,
      ...copyPlugins,
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

  return applyWebpackConfig(config);
}
