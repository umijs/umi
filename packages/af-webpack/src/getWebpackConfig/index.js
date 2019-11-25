import { ProgressPlugin } from 'webpack';
import Config from 'webpack-chain';
import { join, resolve, relative } from 'path';
import { existsSync } from 'fs';
import { EOL } from 'os';
import assert from 'assert';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';
import resolveDefine from './resolveDefine';
// import send, { STARTING } from '../send';

function makeArray(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

export default function(opts) {
  const { cwd } = opts || {};
  const isDev = opts.isDev || process.env.NODE_ENV === 'development';

  const webpackConfig = new Config();

  // mode
  webpackConfig.mode('development');

  // entry
  if (opts.entry) {
    // eslint-disable-next-line guard-for-in
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
    // 不能设为 false，因为 tnpm 是通过 link 处理依赖，设为 false tnpm 下会有大量的冗余模块
    .set('symlinks', true)
    .modules.add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    // Fix yarn global resolve problem
    .add(join(__dirname, '../../../'))
    .end()
    .extensions.merge([
      '.web.js',
      '.wasm',
      '.mjs',
      '.js',
      '.web.jsx',
      '.jsx',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
    ]);

  if (opts.alias) {
    // eslint-disable-next-line guard-for-in
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
    .add(/\.(js|jsx|ts|tsx|mjs|wasm)$/)
    .add(/\.(graphql|gql)$/)
    .add(/\.(css|less|scss|sass|styl(us)?)$/);
  if (opts.urlLoaderExcludes) {
    opts.urlLoaderExcludes.forEach(exclude => {
      rule.add(exclude);
    });
  }
  rule
    .end()
    .use('url-loader')
    .loader(require.resolve('umi-url-pnp-loader'))
    .options({
      limit: opts.inlineLimit || DEFAULT_INLINE_LIMIT,
      name: 'static/[name].[hash:8].[ext]',
    });

  const babelOptsCommon = {
    // Tell babel to guess the type, instead assuming all files are modules
    // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
    sourceType: 'unambiguous',
    cacheDirectory: process.env.BABEL_CACHE !== 'none', // enable by default
    babelrc: !!process.env.BABELRC, // disable by default
    customize: require.resolve('babel-preset-umi/lib/webpack-overrides'),
  };
  const babel = opts.babel || {};
  const babelOpts = {
    presets: [...(babel.presets || []), ...(opts.extraBabelPresets || [])],
    plugins: [
      ...(babel.plugins || []),
      ...(opts.extraBabelPlugins || []),
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent: `${require.resolve('../svgr')}?-prettier,-svgo![path]`,
            },
          },
        },
      ],
    ],
    ...babelOptsCommon,
  };

  if (opts.disableDynamicImport) {
    babelOpts.plugins = [
      ...(babelOpts.plugins || []),
      require.resolve('babel-plugin-dynamic-import-node'),
    ];
  }

  // module -> eslint
  if (process.env.ESLINT && process.env.ESLINT !== 'none') {
    require('./eslint').default(webpackConfig, opts);
  }

  // Avoid "require is not defined" errors
  webpackConfig.module
    .rule('mjs-require')
    .test(/\.mjs$/)
    .type('javascript/auto')
    .include.add(opts.cwd);

  // module -> mjs
  webpackConfig.module
    .rule('mjs')
    .test(/\.mjs$/)
    .include.add(opts.cwd)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

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
  const extraBabelIncludes = (opts.extraBabelIncludes || []).concat(a => {
    if (!a.includes('node_modules')) return false;
    const pkgPath = getPkgPath(a);
    return shouldTransform(pkgPath);
  });
  extraBabelIncludes.forEach((include, index) => {
    const rule = `extraBabelInclude_${index}`;
    webpackConfig.module
      .rule(rule)
      .test(/\.jsx?$/)
      .include.add(include)
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options(babelOpts);
  });

  // module -> tsx?
  const tsConfigFile =
    opts.tsConfigFile ||
    (existsSync(join(opts.cwd, 'tsconfig.json'))
      ? join(opts.cwd, 'tsconfig.json')
      : join(__dirname, 'tsconfig.default.json'));
  webpackConfig.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts)
    .end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({
      configFile: tsConfigFile,
      transpileOnly: true,
      // ref: https://github.com/TypeStrong/ts-loader/blob/fbed24b/src/utils.ts#L23
      errorFormatter(error, colors) {
        const messageColor = error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
        return (
          colors.grey('[tsl] ') +
          messageColor(error.severity.toUpperCase()) +
          (error.file === ''
            ? ''
            : messageColor(' in ') +
              colors.bold.cyan(
                `${relative(cwd, join(error.context, error.file))}(${error.line},${
                  error.character
                })`,
              )) +
          EOL +
          messageColor(`      TS${error.code}: ${error.content}`)
        );
      },
      ...(opts.typescript || {}),
    });

  // module -> gql, graphql
  webpackConfig.module
    .rule('graphql')
    .test(/\.(graphql|gql)$/)
    .exclude.add(/node_modules/)
    .end()
    .use('graphql-tag-loader')
    .loader('graphql-tag/loader');

  // module -> css
  require('./css').default(webpackConfig, opts);

  // plugins -> define
  webpackConfig.plugin('define').use(require('webpack/lib/DefinePlugin'), [resolveDefine(opts)]);

  // plugins -> progress bar
  const NO_PROGRESS = process.env.PROGRESS === 'none';
  if (!process.env.__FROM_UMI_TEST) {
    if (!process.env.CI && !NO_PROGRESS) {
      if (process.platform === 'win32') {
        webpackConfig.plugin('progress').use(require('progress-bar-webpack-plugin'));
      } else {
        webpackConfig.plugin('progress').use(require('webpackbar'), [
          {
            color: 'green',
            reporters: ['fancy'],
          },
        ]);
      }
    }
  }

  // 没用到，先注释了。
  // plugins -> progress report
  // webpackConfig.plugin('progressReport').use(ProgressPlugin, [
  //   percentage => {
  //     send({
  //       type: STARTING,
  //       progress: {
  //         percentage,
  //       },
  //     });
  //   },
  // ]);

  // plugins -> ignore moment locale
  if (opts.ignoreMomentLocale) {
    webpackConfig
      .plugin('ignore-moment-locale')
      .use(require('webpack/lib/IgnorePlugin'), [/^\.\/locale$/, /moment$/]);
  }

  // plugins -> analyze
  if ((process.env.ANALYZE && !opts.ssr) || (process.env.ANALYZE_SSR && opts.ssr)) {
    webpackConfig
      .plugin('bundle-analyzer')
      .use(require('umi-webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: process.env.ANALYZE_MODE || 'server',
          analyzerPort: process.env.ANALYZE_PORT || 8888,
          openAnalyzer: process.env.ANALYZE_OPEN !== 'none',
          // generate stats file while ANALYZE_DUMP exist
          generateStatsFile: !!process.env.ANALYZE_DUMP,
          statsFilename: process.env.ANALYZE_DUMP || 'stats.json',
          logLevel: process.env.ANALYZE_LOG_LEVEL || 'info',
          defaultSizes: 'parsed', // stat  // gzip
        },
      ]);
  }

  // plugins -> analyze report
  if (process.env.ANALYZE_REPORT) {
    webpackConfig
      .plugin('bundle-analyzer-reporter')
      .use(require('umi-webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: 'disabled', // 关闭 analyzer server
          generateReportFile: true, // 开启报告生成功能
          reportDepth: 2, // 裁剪深度 2
          reportDir: process.cwd(),
          statsFilename: process.env.ANALYZE_DUMP || 'bundlestats.json', // 默认生成到 bundlestats.json
        },
      ]);
  }

  if (process.env.DUPLICATE_CHECKER) {
    webpackConfig
      .plugin('duplicate-package-checker')
      .use(require('duplicate-package-checker-webpack-plugin'));
  }

  if (process.env.FORK_TS_CHECKER) {
    webpackConfig.plugin('fork-ts-checker').use(require('fork-ts-checker-webpack-plugin'), [
      {
        formatter: 'codeframe',
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
      webpackConfig.plugin(`copy-${index}`).use(require('copy-webpack-plugin'), [[copy]]);
    });
  }

  if (!process.env.__FROM_UMI_TEST) {
    // filter `Conflicting order between` warning
    webpackConfig
      .plugin('filter-css-conflicting-warnings')
      .use(require('./FilterCSSConflictingWarning').default);

    // plugins -> friendly-errors
    const { CLEAR_CONSOLE = 'none' } = process.env;
    webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [
      {
        clearConsole: CLEAR_CONSOLE !== 'none',
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
  let config = webpackConfig.toConfig();
  if (process.env.SPEED_MEASURE && !opts.ssr) {
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
    const smpOption =
      process.env.SPEED_MEASURE === 'CONSOLE'
        ? { outputFormat: 'human', outputTarget: console.log }
        : { outputFormat: 'json', outputTarget: join(process.cwd(), 'speed-measure.json') };
    const smp = new SpeedMeasurePlugin(smpOption);
    config = smp.wrap(config);
  }
  return config;
}
