import Config from 'webpack-chain';
import { join, dirname, resolve } from 'path';
import { existsSync } from 'fs';
import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';
import resolveDefine from './resolveDefine';
import { applyWebpackConfig } from './applyWebpackConfig';

function makeArray(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

export default function(opts) {
  const { cwd } = opts;
  const isDev = process.env.NODE_ENV === 'development';

  assert(
    opts.entry && isPlainObject(opts.entry),
    `opts.entry must be Plain Object, but got ${opts.entry}`,
  );

  const webpackConfig = new Config();

  // mode
  webpackConfig.mode('development');

  // entry
  for (const key in opts.entry) {
    const entry = webpackConfig.entry(key);
    makeArray(opts.entry[key]).forEach(file => {
      entry.add(file);
    });
  }

  // output
  const absOutputPath = resolve(cwd, opts.outputPath || 'dist');
  webpackConfig.output
    .path(absOutputPath)
    .filename(`[name].js`)
    .chunkFilename(`[name].async.js`)
    .publicPath(opts.publicPath || undefined);

  // resolve
  webpackConfig.resolve
    .set('symlinks', false)
    .modules.add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    .end()
    .extensions.merge([
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.json',
      '.jsx',
      '.ts',
      '.tsx',
    ])
    .end()
    .alias // .set('@', api.resolve('src'))
    .set(
      '@babel/runtime',
      dirname(require.resolve('@babel/runtime/package.json')),
    );

  if (opts.alias) {
    for (const key in opts.alias) {
      webpackConfig.resolve.alias.set(key, opts.alias[key]);
    }
  }

  // resolveLoader
  webpackConfig.resolveLoader.modules
    .add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    .end();

  // module -> exclude
  const DEFAULT_INLINE_LIMIT = 10000;
  webpackConfig.module
    .rule('exclude')
    .exclude.add(/\.json$/)
    .add(/\.(js|jsx|ts|tsx)$/)
    .add(/\.(css|less|scss|sass)$/)
    .end()
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: opts.inlineLimit || DEFAULT_INLINE_LIMIT,
      name: 'static/[name].[hash.8].[ext]',
    });

  const babelOptsCommon = {
    cacheDirectory: process.env.BABEL_CACHE !== 'none', // enable by default
    babelrc: !!process.env.BABELRC, // disable by default
  };
  const babelOpts = {
    ...opts.babel,
    ...babelOptsCommon,
  };
  const babelOptsForDeps = {
    presets: [
      [require.resolve('babel-preset-umi'), { disableTransform: true }],
    ],
    ...babelOptsCommon,
  };
  if (opts.disableDynamicImport) {
    babelOpts.plugins = [
      ...(babelOpts.plugins || []),
      require.resolve('babel-plugin-dynamic-import-node-sync'),
    ];
    babelOptsForDeps.plugins = [
      ...(babelOptsForDeps.plugins || []),
      require.resolve('babel-plugin-dynamic-import-node-sync'),
    ];
  }

  // module -> js
  webpackConfig.module
    .rule('js')
    .test(/\.js$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

  // module -> jsx
  // jsx 不 exclude node_modules
  webpackConfig.module
    .rule('jsx')
    .test(/\.jsx$/)
    .include.add(opts.cwd)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

  // module -> extraBabelIncludes
  // suport es5ImcompatibleVersions
  const extraBabelIncludes = opts.extraBabelIncludes || [];
  if (opts.es5ImcompatibleVersions) {
    extraBabelIncludes.push(a => {
      if (a.indexOf('node_modules') === -1) return false;
      const pkgPath = getPkgPath(a);
      return shouldTransform(pkgPath);
    });
  }
  extraBabelIncludes.forEach((include, index) => {
    const rule = `extraBabelInclude_${index}`;
    webpackConfig.module
      .rule(rule)
      .test(/\.jsx?$/)
      .include.add(include)
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options(babelOptsForDeps);
  });

  // module -> tsx?
  const tsConfigFile = opts.tsConfigFile || join(opts.cwd, 'tsconfig.json');
  webpackConfig.module
    .rule('ts')
    .test(/\.tsx?$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use('awesome-typescript-loader')
    .loader(require.resolve('awesome-typescript-loader'))
    .options({
      configFileName: tsConfigFile,
      transpileOnly: true,
      ...(opts.typescript || {}),
    });

  // module -> css
  require('./css').default(webpackConfig, opts);

  // plugins -> define
  webpackConfig
    .plugin('case-sensitive')
    .use(require('webpack/lib/DefinePlugin'), [resolveDefine(opts)]);

  // plugins -> case sensitive
  webpackConfig
    .plugin('case-sensitive-paths')
    .use(require('case-sensitive-paths-webpack-plugin'));

  // plugins -> progress bar
  if (!process.env.__FROM_UMI_TEST) {
    webpackConfig.plugin('progress').use(require('webpack/lib/ProgressPlugin'));
  }

  // plugins -> ignore moment locale
  if (opts.ignoreMomentLocale) {
    webpackConfig
      .plugin('ignore-moment-locale')
      .use(require('webpack/lib/IgnorePlugin'), [/^\.\/locale$/, /moment$/]);
  }

  // plugins -> analyze
  if (process.env.ANALYZE) {
    webpackConfig
      .plugin('bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: 'server',
          analyzerPort: process.env.ANALYZE_PORT || 8888,
          openAnalyzer: true,
        },
      ]);
  }

  // plugins -> copy
  if (existsSync(join(opts.cwd, 'public'))) {
    webpackConfig.plugin('copy-public').use(require('copy-webpack-plugin'), [
      [
        {
          from: join(opts.cwd, 'public'),
          to: absOutputPath,
          toType: 'dir',
        },
      ],
    ]);
  }
  if (opts.copy) {
    makeArray(opts.copy).forEach((copy, index) => {
      if (typeof copy === 'string') {
        copy = {
          from: join(opts.cwd, copy),
          to: absOutputPath,
        };
      }
      webpackConfig
        .plugin(`copy-${index}`)
        .use(require('copy-webpack-plugin'), [[copy]]);
    });
  }

  // plugins -> friendly-errors
  if (!process.env.__FROM_UMI_TEST) {
    webpackConfig
      .plugin('friendly-errors')
      .use(require('friendly-errors-webpack-plugin'), [
        {
          clearConsole: process.env.CLEAR_CONSOLE !== 'none',
        },
      ]);
  }

  // externals
  if (opts.externals) {
    webpackConfig.externals(opts.externals);
  }

  // node
  webpackConfig.node.merge({
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  });

  if (isDev) {
    require('./dev').default(webpackConfig, opts);
  } else {
    require('./prod').default(webpackConfig, opts);
  }

  return applyWebpackConfig(opts.cwd, webpackConfig.toConfig());
}
