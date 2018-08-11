import Config from 'webpack-chain';
import { join, resolve, relative } from 'path';
import { existsSync } from 'fs';
import assert from 'assert';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';
import resolveDefine from './resolveDefine';

function makeArray(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

export default function(opts) {
  const { cwd } = opts;
  const isDev = process.env.NODE_ENV === 'development';

  const webpackConfig = new Config();

  // mode
  webpackConfig.mode('development');

  // entry
  if (opts.entry) {
    for (const key in opts.entry) {
      const entry = webpackConfig.entry(key);
      makeArray(opts.entry[key]).forEach(file => {
        entry.add(file);
      });
    }
  }

  // output
  const absOutputPath = resolve(cwd, opts.outputPath || 'dist');
  webpackConfig.output
    .path(absOutputPath)
    .filename(`[name].js`)
    .chunkFilename(`[name].async.js`)
    .publicPath(opts.publicPath || undefined)
    .devtoolModuleFilenameTemplate(info => {
      return relative(opts.cwd, info.absoluteResourcePath).replace(/\\/g, '/');
    });

  // resolve
  webpackConfig.resolve
    .set('symlinks', false)
    .modules.add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    .end()
    .extensions.merge([
      '.web.js',
      '.mjs',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
    ]);

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

  if (!opts.disableDynamicImport && !process.env.__FROM_UMI_TEST) {
    webpackConfig.optimization
      .splitChunks({
        chunks: 'async',
        name: 'vendors',
      })
      .runtimeChunk(false);
  }

  // module -> exclude
  const DEFAULT_INLINE_LIMIT = 10000;
  const rule = webpackConfig.module
    .rule('exclude')
    .exclude.add(/\.json$/)
    .add(/\.(js|jsx|ts|tsx)$/)
    .add(/\.(css|less|scss|sass)$/);
  if (opts.urlLoaderExcludes) {
    opts.urlLoaderExcludes.forEach(exclude => {
      rule.add(exclude);
    });
  }
  rule
    .end()
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: opts.inlineLimit || DEFAULT_INLINE_LIMIT,
      name: 'static/[name].[hash:8].[ext]',
    });

  const babelOptsCommon = {
    cacheDirectory: process.env.BABEL_CACHE !== 'none', // enable by default
    babelrc: !!process.env.BABELRC, // disable by default
  };
  const babel = opts.babel || {};
  const babelOpts = {
    presets: [...(babel.presets || []), ...(opts.extraBabelPresets || [])],
    plugins: [...(babel.plugins || []), ...(opts.extraBabelPlugins || [])],
    ...babelOptsCommon,
  };
  const babelOptsForDeps = {
    presets: [
      [require.resolve('babel-preset-umi'), { transformRuntime: false }],
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
    .plugin('define')
    .use(require('webpack/lib/DefinePlugin'), [resolveDefine(opts)]);

  // plugins -> case sensitive
  webpackConfig
    .plugin('case-sensitive-paths')
    .use(require('case-sensitive-paths-webpack-plugin'));

  // plugins -> progress bar
  if (!process.env.__FROM_UMI_TEST) {
    webpackConfig
      .plugin('progress')
      .use(require('webpackbar'), [{ minimal: false }]);
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

  if (opts.chainConfig) {
    assert(
      typeof opts.chainConfig === 'function',
      `opts.chainConfig should be function, but got ${opts.chainConfig}`,
    );
    opts.chainConfig(webpackConfig);
  }

  return webpackConfig.toConfig();
}
