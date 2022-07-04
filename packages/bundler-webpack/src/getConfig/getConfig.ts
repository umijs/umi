import {
  getBabelDepsOpts,
  getBabelOpts,
  getBabelPresetOpts,
  getTargetsAndBrowsersList,
} from '@umijs/bundler-utils';
import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import {
  BundlerConfigType,
  IBundlerConfigType,
  IConfig,
  ICopy,
} from '@umijs/types';
import { deepmerge, lodash } from '@umijs/utils';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import Config from 'webpack-chain';
import css, { createCSSRule } from './css';
import {
  es5ImcompatibleVersionsToPkg,
  excludeToPkgs,
  isMatch,
  TYPE_ALL_EXCLUDE,
} from './nodeModulesTransform';
import { getPkgPath, shouldTransform } from './pkgMatch';
import resolveDefine from './resolveDefine';
import terserOptions from './terserOptions';

function onWebpackInitWithPromise() {
  return new Promise<void>((resolve) => {
    defaultWebpack.onWebpackInit(() => {
      resolve();
    });
  });
}

export interface IOpts {
  cwd: string;
  config: IConfig;
  type: IBundlerConfigType;
  env: 'development' | 'production';
  entry?: {
    [key: string]: string;
  };
  hot?: boolean;
  port?: number;
  babelOpts?: object;
  babelOptsForDep?: object;
  mfsu?: boolean;
  targets?: any;
  browserslist?: any;
  bundleImplementor?: typeof defaultWebpack;
  modifyBabelOpts?: (opts: object, args?: any) => Promise<any>;
  modifyBabelPresetOpts?: (opts: object, args?: any) => Promise<any>;
  chainWebpack?: (webpackConfig: any, args: any) => Promise<any>;
  miniCSSExtractPluginPath?: string;
  miniCSSExtractPluginLoaderPath?: string;
  __disableTerserForTest?: boolean;
}

export default async function getConfig(
  opts: IOpts,
): Promise<defaultWebpack.Configuration> {
  await onWebpackInitWithPromise();
  const {
    cwd,
    config,
    type,
    env,
    entry,
    hot,
    port,
    mfsu,
    bundleImplementor = defaultWebpack,
    modifyBabelOpts,
    modifyBabelPresetOpts,
    miniCSSExtractPluginPath,
    miniCSSExtractPluginLoaderPath,
  } = opts;
  let webpackConfig = new Config();

  webpackConfig.mode(env);

  const isWebpack5 = bundleImplementor.version!.startsWith('5');
  const isDev = env === 'development';
  const isProd = env === 'production';
  const disableCompress = process.env.COMPRESS === 'none';

  // entry
  if (entry) {
    Object.keys(entry).forEach((key) => {
      const e = webpackConfig.entry(key);
      // 提供打包好的版本，不消耗 webpack 编译时间
      // if (hot && isDev) {
      //   e.add(require.resolve('../webpackHotDevClient/webpackHotDevClient'));
      // }
      if (config.runtimePublicPath) {
        e.add(require.resolve('./runtimePublicPathEntry'));
      }
      e.add(entry[key]);
    });
  }

  // devtool
  const devtool = config.devtool as Config.DevTool;
  webpackConfig.devtool(
    isDev
      ? // devtool 设为 false 时不 fallback 到 cheap-module-source-map
        devtool === false
        ? false
        : devtool || 'cheap-module-source-map'
      : devtool,
  );

  const useHash = (mfsu && isDev) || (config.hash && isProd);
  const absOutputPath = join(cwd, config.outputPath || 'dist');

  webpackConfig.output
    .path(absOutputPath)
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(useHash ? `[name].[contenthash:8].async.js` : `[name].js`)
    .publicPath(config.publicPath! as unknown as string)
    .pathinfo(isDev || disableCompress);

  if (!isWebpack5) {
    webpackConfig.output
      // remove this after webpack@5
      // free memory of assets after emitting
      .futureEmitAssets(true);
  }

  // resolve
  // prettier-ignore
  webpackConfig.resolve
    // 不能设为 false，因为 tnpm 是通过 link 处理依赖，设为 false tnpm 下会有大量的冗余模块
    .set('symlinks', true)
    .modules
      .add('node_modules')
      .add(join(__dirname, '../../node_modules'))
      // TODO: 处理 yarn 全局安装时的 resolve 问题
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

  // resolve.alias
  if (config.alias) {
    Object.keys(config.alias).forEach((key) => {
      webpackConfig.resolve.alias.set(key, config.alias![key]);
    });
  }

  // 都用绝对地址，应该不用配 resolveLoader
  // webpackConfig.resolveLoader.modules
  //   .add(join(__dirname, '../../node_modules'))
  //   .add(join(__dirname, '../../../../node_modules'));

  // modules and loaders ---------------------------------------------

  const { targets, browserslist } = getTargetsAndBrowsersList({
    config,
    type,
  });
  let presetOpts = getBabelPresetOpts({
    config,
    env,
    targets,
  });
  if (modifyBabelPresetOpts) {
    presetOpts = await modifyBabelPresetOpts(presetOpts, {
      type,
      mfsu,
    });
  }
  let babelOpts = getBabelOpts({
    cwd,
    config,
    presetOpts,
  });
  if (modifyBabelOpts) {
    babelOpts = await modifyBabelOpts(babelOpts, {
      type,
      mfsu,
    });
  }

  // prettier-ignore
  webpackConfig.module
    .rule('js')
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .include.add([
        cwd,
        // import module out of cwd using APP_ROOT
        // issue: https://github.com/umijs/umi/issues/5594
        ...(process.env.APP_ROOT ? [process.cwd()] : [])
      ]).end()
      .exclude
        .add(/node_modules/)
        // don't compile mfsu temp files
        // TODO: do not hard code
        .add(/\.mfsu/)
        .end()
      .use('babel-loader')
        .loader(require.resolve('@umijs/deps/compiled/babel-loader'))
        .options(babelOpts);

  if (config.extraBabelIncludes) {
    config.extraBabelIncludes.forEach((include, index) => {
      const rule = `extraBabelInclude_${index}`;
      // prettier-ignore
      webpackConfig.module
        .rule(rule)
          .test(/\.(js|mjs|jsx)$/)
            .include
            .add((a: any) => {
              // 支持绝对路径匹配
              if (isAbsolute(include)) {
                return a.includes(include);
              }

              // 支持 node_modules 下的 npm 包
              if (!a.includes('node_modules')) return false;
              const pkgPath = getPkgPath(a);
              return shouldTransform(pkgPath, include);
            })
            .end()
          .use('babel-loader')
            .loader(require.resolve('@umijs/deps/compiled/babel-loader'))
            .options(babelOpts);
    });
  }

  // prettier-ignore
  webpackConfig.module
    .rule('ts-in-node_modules')
      .test(/\.(jsx|ts|tsx)$/)
      .include.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('@umijs/deps/compiled/babel-loader'))
        .options(babelOpts);

  // prettier-ignore
  const rule = webpackConfig.module
    .rule('js-in-node_modules')
      .test(/\.(js|mjs)$/);
  const nodeModulesTransform = config.nodeModulesTransform || {
    type: 'all',
    exclude: [],
  };
  if (nodeModulesTransform.type === 'all') {
    const exclude = lodash.uniq([
      ...TYPE_ALL_EXCLUDE,
      ...(nodeModulesTransform.exclude || []),
    ]);
    const pkgs = excludeToPkgs({ exclude });
    // prettier-ignore
    rule
      .include
        .add(/node_modules/)
        .end()
      .exclude.add((path: any) => {
        return isMatch({ path, pkgs });
      })
        .end();
  } else {
    const pkgs = {
      ...es5ImcompatibleVersionsToPkg(),
      ...excludeToPkgs({ exclude: nodeModulesTransform.exclude || [] }),
    };
    rule.include
      .add((path: any) => {
        return isMatch({
          path,
          pkgs,
        });
      })
      .end();
  }

  rule
    .use('babel-loader')
    .loader(require.resolve('@umijs/deps/compiled/babel-loader'))
    .options(
      getBabelDepsOpts({
        cwd,
        env,
        config,
      }),
    );

  const staticDir = mfsu ? 'mf-static' : 'static';

  // prettier-ignore
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp|ico)(\?.*)?$/)
    .use('url-loader')
      .loader(require.resolve('@umijs/deps/compiled/url-loader'))
      .options({
        limit: config.inlineLimit || 10000,
        name: `${staticDir}/[name].[hash:8].[ext]`,
        // require 图片的时候不用加 .default
        esModule: false,
        fallback: {
          loader: require.resolve('@umijs/deps/compiled/file-loader'),
          options: {
            name: `${staticDir}/[name].[hash:8].[ext]`,
            esModule: false,
          },
        }
      });

  // prettier-ignore
  webpackConfig.module
  .rule('avif')
  .test(/\.(avif)(\?.*)?$/)
  .use('file-loader')
    .loader(require.resolve('@umijs/deps/compiled/file-loader'))
    .options({
      name: `${staticDir}/[name].[hash:8].[ext]`,
      esModule: false,
    });

  // prettier-ignore
  webpackConfig.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('@umijs/deps/compiled/file-loader'))
      .options({
        name: `${staticDir}/[name].[hash:8].[ext]`,
        esModule: false,
      });

  // prettier-ignore
  webpackConfig.module
    .rule('fonts')
    .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('@umijs/deps/compiled/file-loader'))
      .options({
        name: `${staticDir}/[name].[hash:8].[ext]`,
        esModule: false,
      });

  // prettier-ignore
  webpackConfig.module
    .rule('plaintext')
    .test(/\.(txt|text|md)$/)
    .use('raw-loader')
      .loader(require.resolve('@umijs/deps/compiled/raw-loader'));

  if (config.workerLoader) {
    // prettier-ignore
    webpackConfig.module
      .rule('worker')
      .test(/.*worker.(ts|js)/)
      .use('worker-loader')
        .loader(require.resolve('@umijs/deps/compiled/worker-loader'))
        .options(config.workerLoader);
  }

  // css
  css({
    type,
    mfsu,
    config,
    webpackConfig,
    isDev,
    disableCompress,
    browserslist,
    miniCSSExtractPluginPath,
    miniCSSExtractPluginLoaderPath,
  });

  // externals
  if (config.externals) {
    webpackConfig.externals(config.externals);
  }

  // node shims
  if (!isWebpack5) {
    webpackConfig.node.merge({
      setImmediate: false,
      module: 'empty',
      dns: 'mock',
      http2: 'empty',
      process: 'mock',
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    });
  }

  if (isWebpack5) {
    // @ts-ignore
    webpackConfig.target(['web', 'es5']);
  }

  // plugins -> ignore moment locale
  if (config.ignoreMomentLocale) {
    webpackConfig
      .plugin('ignore-moment-locale')
      .use(bundleImplementor.IgnorePlugin, [
        {
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        },
      ]);
  }

  // define
  webpackConfig.plugin('define').use(bundleImplementor.DefinePlugin, [
    resolveDefine({
      define: config.define || {},
    }),
  ] as any);

  // progress
  if (process.env.PROGRESS !== 'none') {
    webpackConfig
      .plugin('progress')
      .use(require.resolve('@umijs/deps/compiled/webpackbar'), [
        mfsu
          ? {
              name: 'MFSU',
              color: '#faac00',
            }
          : config.ssr
          ? { name: type === BundlerConfigType.ssr ? 'Server' : 'Client' }
          : {},
      ]);
  }

  // copy
  const copyPatterns = [
    existsSync(join(cwd, 'public')) && {
      from: join(cwd, 'public'),
      info: { minimized: true },
    },
    ...(config.copy
      ? config.copy.map((item: ICopy | string) => {
          if (typeof item === 'string') {
            return {
              from: join(cwd, item),
              to: absOutputPath,
              info: { minimized: true },
            };
          }
          return {
            from: join(cwd, item.from),
            to: join(absOutputPath, item.to),
            info: { minimized: true },
          };
        })
      : []),
  ].filter(Boolean);

  if (copyPatterns.length) {
    webpackConfig
      .plugin('copy')
      .use(require.resolve('@umijs/deps/compiled/copy-webpack-plugin'), [
        {
          patterns: copyPatterns,
        },
      ]);
  }

  // timefix
  // webpackConfig
  //   .plugin('MildCompilePlugin')
  //   .use(require('webpack-mild-compile').Plugin);

  // error handler
  if (process.env.FRIENDLY_ERROR !== 'none') {
    webpackConfig
      .plugin('friendly-error')
      .use(
        require.resolve('@umijs/deps/compiled/friendly-errors-webpack-plugin'),
        [
          {
            clearConsole: false,
          },
        ],
      );
  }

  // profile
  if (process.env.WEBPACK_PROFILE) {
    webpackConfig.profile(true);
    const statsInclude = ['verbose', 'normal', 'minimal'];
    webpackConfig.stats(
      (statsInclude.includes(process.env.WEBPACK_PROFILE)
        ? process.env.WEBPACK_PROFILE
        : 'verbose') as defaultWebpack.Options.Stats,
    );
    const StatsPlugin = require('@umijs/deps/compiled/stats-webpack-plugin');
    webpackConfig.plugin('stats-webpack-plugin').use(
      new StatsPlugin('stats.json', {
        chunkModules: true,
      }),
    );
  }

  const enableManifest = () => {
    // manifest
    if (config.manifest && type === BundlerConfigType.csr) {
      webpackConfig
        .plugin('manifest')
        .use(
          require('@umijs/deps/compiled/webpack-manifest-plugin')
            .WebpackManifestPlugin,
          [
            {
              fileName: 'asset-manifest.json',
              ...config.manifest,
            },
          ],
        );
    }
  };

  webpackConfig.when(
    isDev,
    (webpackConfig) => {
      // mfsu 构建如果有 hmr，会和主应用的 hmr 冲突，因为公用一套全局变量
      if (!mfsu && hot) {
        webpackConfig
          .plugin('hmr')
          .use(bundleImplementor.HotModuleReplacementPlugin);
      }
      if (config.ssr && config.dynamicImport) {
        enableManifest();
      }
    },
    (webpackConfig) => {
      // don't emit files if have error
      webpackConfig.optimization.noEmitOnErrors(true);

      // don't show hints when size is too large
      webpackConfig.performance.hints(false);

      // webpack/lib/HashedModuleIdsPlugin
      // https://webpack.js.org/plugins/hashed-module-ids-plugin/
      // webpack@5 has enabled this in prod by default
      if (!isWebpack5) {
        webpackConfig
          .plugin('hash-module-ids')
          .use(bundleImplementor.HashedModuleIdsPlugin, []);
      }

      // manifest
      enableManifest();

      // compress
      if (disableCompress) {
        webpackConfig.optimization.minimize(false);
      } else if (!opts.__disableTerserForTest) {
        webpackConfig.optimization
          .minimizer('terser')
          .use(require.resolve('../webpack/plugins/terser-webpack-plugin'), [
            {
              terserOptions: deepmerge(
                terserOptions,
                config.terserOptions || {},
              ),
              sourceMap: Boolean(config.devtool),
              cache: process.env.TERSER_CACHE !== 'none',
              // 兼容内部流程系统，读到的 cpu 数并非真实的
              // 使用 SIGMA_MAX_PROCESSORS_LIMIT 指定真核数
              parallel: process.env.SIGMA_MAX_PROCESSORS_LIMIT
                ? parseInt(process.env.SIGMA_MAX_PROCESSORS_LIMIT, 10)
                : true,
              extractComments: false,
            },
          ]);
      }
    },
  );

  function createCSSRuleFn(opts: any) {
    createCSSRule({
      webpackConfig,
      config,
      isDev,
      type,
      browserslist,
      miniCSSExtractPluginLoaderPath,
      ...opts,
    });
  }

  if (opts.chainWebpack) {
    webpackConfig = await opts.chainWebpack(webpackConfig, {
      type,
      mfsu,
      webpack: bundleImplementor,
      createCSSRule: createCSSRuleFn,
    });
  }
  // 用户配置的 chainWebpack 优先级最高
  if (config.chainWebpack) {
    // @ts-ignore
    await config.chainWebpack(webpackConfig, {
      type,
      env,
      // @ts-ignore
      webpack: bundleImplementor,
      createCSSRule: createCSSRuleFn,
    });
  }
  let ret = webpackConfig.toConfig() as defaultWebpack.Configuration;

  // node polyfills
  const nodeLibs = require('node-libs-browser');
  if (isWebpack5) {
    ret.plugins!.push(
      new bundleImplementor.ProvidePlugin({
        process: nodeLibs['process'],
      }),
    );
    ret.plugins!.push(
      // ref: https://github.com/umijs/umi/issues/6914
      // @ts-ignore
      new bundleImplementor.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    );
    // @ts-ignore
    ret.resolve.fallback = {
      // @ts-ignore
      ...ret.resolve.fallback,
      ...Object.keys(nodeLibs).reduce((memo, key) => {
        if (nodeLibs[key]) {
          memo[key] = nodeLibs[key];
        } else {
          memo[key] = false;
        }
        return memo;
      }, {}),

      // disable unnecessary node libs
      http: false,
      https: false,

      // css hotModuleReplacement depends on punycode
      // ref: https://github.com/charpeni/react-native-url-polyfill/issues/140
      // punycode: false,

      // mammoth deps on these
      // ref: https://github.com/umijs/umi/issues/6318
      // stream: false,
      // _stream_duplex: false,
      // _stream_passthrough: false,
      // _stream_readable: false,
      // _stream_transform: false,
      // _stream_writable: false,
    };
  }

  // speed-measure-webpack-plugin
  if (process.env.SPEED_MEASURE && type === BundlerConfigType.csr) {
    const SpeedMeasurePlugin = require('@umijs/deps/compiled/speed-measure-webpack-plugin');
    const smpOption =
      process.env.SPEED_MEASURE === 'CONSOLE'
        ? { outputFormat: 'human', outputTarget: console.log }
        : {
            outputFormat: 'json',
            outputTarget: join(process.cwd(), 'speed-measure.json'),
          };
    const smp = new SpeedMeasurePlugin(smpOption);
    ret = smp.wrap(ret);
  }

  return ret;
}
