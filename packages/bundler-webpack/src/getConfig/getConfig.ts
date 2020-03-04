import { IConfig } from '@umijs/types';
import defaultWebpack from 'webpack';
import Config from 'webpack-chain';
import { join } from 'path';
import { existsSync } from 'fs';
import { deepmerge } from '@umijs/utils';
import {
  ConfigType,
  getBabelDepsOpts,
  getBabelOpts,
  getBabelPresetOpts,
  getTargetsAndBrowsersList,
} from '@umijs/bundler-utils';
import css from './css';
import terserOptions from './terserOptions';
import { objToStringified } from './utils';

export interface IOpts {
  cwd: string;
  config: IConfig;
  type: ConfigType;
  env: 'development' | 'production';
  entry?: {
    [key: string]: string;
  };
  hot?: boolean;
  port?: number;
  babelOpts?: object;
  babelOptsForDep?: object;
  targets?: any;
  browserslist?: any;
  bundleImplementor?: typeof defaultWebpack;
  modifyBabelOpts?: (opts: object) => Promise<any>;
  modifyBabelPresetOpts?: (opts: object) => Promise<any>;
  chainWebpack?: (webpackConfig: any, args: any) => Promise<any>;
  miniCSSExtractPluginPath?: string;
  miniCSSExtractPluginLoaderPath?: string;
}

export default async function getConfig(
  opts: IOpts,
): Promise<defaultWebpack.Configuration> {
  const {
    cwd,
    config,
    type,
    env,
    entry,
    hot,
    port,
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
    Object.keys(entry).forEach(key => {
      const e = webpackConfig.entry(key);
      if (hot && isDev) {
        e.add(require.resolve('../webpackHotDevClient/webpackHotDevClient'));
      }
      if (config.runtimePublicPath) {
        e.add(require.resolve('./runtimePublicPathEntry'));
      }
      e.add(entry[key]);
    });
  }

  // devtool
  webpackConfig.devtool(
    isDev
      ? (config.devtool as Config.DevTool) || 'cheap-module-source-map'
      : (config.devtool as Config.DevTool),
  );

  const useHash = config.hash && isProd;
  const absOutputPath = join(cwd, config.outputPath || 'dist');

  webpackConfig.output
    .path(absOutputPath)
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(useHash ? `[name].[contenthash:8].async.js` : `[name].js`)
    .publicPath(config.publicPath!)
    // remove this after webpack@5
    // free memory of assets after emitting
    .futureEmitAssets(true)
    .pathinfo(isDev || disableCompress);

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
    Object.keys(config.alias).forEach(key => {
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
    presetOpts = await modifyBabelPresetOpts(presetOpts);
  }
  let babelOpts = getBabelOpts({
    cwd,
    config,
    presetOpts,
  });
  if (modifyBabelOpts) {
    babelOpts = await modifyBabelOpts(babelOpts);
  }

  // prettier-ignore
  webpackConfig.module
    .rule('js')
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .include.add(cwd).end()
      .exclude.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(babelOpts);

  // prettier-ignore
  webpackConfig.module
    .rule('ts-in-node_modules')
      .test(/\.(jsx|ts|tsx)$/)
      .include.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(babelOpts);

  // prettier-ignore
  webpackConfig.module
    .rule('js-in-node_modules')
      .test(/\.(js|mjs)$/)
      .include.add(/node_modules/).end()
      // TODO: 处理 tnpm 下 @babel/rutnime 路径变更问题
      .exclude
        .add(/@babel(?:\/|\\{1,2})runtime/)
        .add(/(react|react-dom|lodash)/)
        .end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(getBabelDepsOpts({
          cwd,
          env,
          config,
        }));

  // prettier-ignore
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
      .loader(require.resolve('url-loader'))
      .options({
        limit: config.inlineLimit || 10000,
        name: 'static/[name].[hash:8].[ext]',
        // require 图片的时候不用加 .default
        esModule: false,
        fallback: {
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/[name].[hash:8].[ext]',
            esModule: false,
          },
        }
      });

  // prettier-ignore
  webpackConfig.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: 'static/[name].[hash:8].[ext]',
        esModule: false,
      });

  // prettier-ignore
  webpackConfig.module
    .rule('fonts')
    .test(/\.(eot|woff|woff2|ttf)(\?.*)?$/)
    .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: 'static/[name].[hash:8].[ext]',
        esModule: false,
      });

  // css
  css({
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
    {
      'process.env': objToStringified({
        ...process.env,
        NODE_ENV: env,
      }),
      ...objToStringified(config.define || {}),
    },
  ] as any);

  // progress
  if (!isWebpack5 && process.env.PROGRESS !== 'none') {
    webpackConfig.plugin('progress').use(require.resolve('webpackbar'));
  }

  // copy
  webpackConfig.plugin('copy').use(require.resolve('copy-webpack-plugin'), [
    [
      existsSync(join(cwd, 'public')) && {
        from: join(cwd, 'public'),
        to: absOutputPath,
      },
      ...(config.copy
        ? config.copy.map(from => ({
            from: join(cwd, from),
            to: absOutputPath,
          }))
        : []),
    ].filter(Boolean),
  ]);

  // timefix
  // webpackConfig
  //   .plugin('MildCompilePlugin')
  //   .use(require('webpack-mild-compile').Plugin);

  // error handler
  if (process.env.FRIENDLY_ERROR !== 'none') {
    webpackConfig
      .plugin('friendly-error')
      .use(require.resolve('friendly-errors-webpack-plugin'), [
        {
          clearConsole: false,
        },
      ]);
  }

  webpackConfig.when(
    isDev,
    webpackConfig => {
      webpackConfig
        .plugin('hmr')
        .use(bundleImplementor.HotModuleReplacementPlugin);
    },
    webpackConfig => {
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
      if (config.manifest && !config.ssr) {
        webpackConfig
          .plugin('manifest')
          .use(require.resolve('webpack-manifest-plugin'), [
            {
              fileName: 'asset-manifest.json',
              ...config.manifest,
            },
          ]);
      }

      // compress
      if (disableCompress) {
        webpackConfig.optimization.minimize(false);
      } else {
        webpackConfig.optimization
          .minimizer('terser')
          .use(require.resolve('terser-webpack-plugin'), [
            {
              terserOptions: deepmerge(
                terserOptions,
                config.terserOptions || {},
              ),
              sourceMap: false,
              cache: true,
              parallel: true,
              extractComments: false,
            },
          ]);
      }
    },
  );

  if (opts.chainWebpack) {
    webpackConfig = await opts.chainWebpack(webpackConfig, {
      webpack: bundleImplementor,
    });
  }
  // 用户配置的 chainWebpack 优先级最高
  if (config.chainWebpack) {
    config.chainWebpack(webpackConfig, {
      env,
      webpack: bundleImplementor,
    });
  }
  let ret = webpackConfig.toConfig() as defaultWebpack.Configuration;

  // speed-measure-webpack-plugin
  if (process.env.SPEED_MEASURE && type === ConfigType.csr) {
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
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
