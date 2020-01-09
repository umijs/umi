import { IConfig } from '@umijs/types';
import Config from 'webpack-chain';
import { join } from 'path';
import { ConfigType } from '../enums';
import css from './css';
import { getBabelDepsOpts, getBabelOpts } from './getBabelOpts';

export interface IOpts {
  cwd: string;
  config: IConfig;
  type: string;
  env: 'development' | 'production';
}

export default function({ cwd, config, type, env }: IOpts) {
  const webpackConfig = new Config();

  webpackConfig.mode(env);

  // TODO: 处理 entry
  if (type === ConfigType.csr) {
    const tmpDir =
      process.env.NODE_ENV === 'development'
        ? '.umi'
        : `.umi-${process.env.NODE_ENV}`;
    webpackConfig.entry('umi').add(join(cwd, tmpDir, 'umi.ts'));
  }

  const isDev = env === 'development';
  const isProd = env === 'production';
  const disableCompress = process.env.COMPRESS === 'none';

  // devtool
  webpackConfig.devtool(
    isDev
      ? (config.devtool as Config.DevTool) || 'cheap-module-source-map'
      : (config.devtool as Config.DevTool),
  );

  const useHash = config.hash && isProd;
  webpackConfig.output
    .path(join(cwd, config.outputPath || 'dist'))
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(useHash ? `[name].[contenthash:8].async.js` : `[name].js`)
    .publicPath(config.publicPath!)
    // remove this after webpack@5
    .futureEmitAssets(true)
    .pathinfo(isDev || disableCompress);

  // resolve
  // prettier-ignore
  webpackConfig.resolve
    // 不能设为 false，因为 tnpm 是通过 link 处理依赖，设为 false tnpm 下会有大量的冗余模块
    .set('symlinks', true)
    .modules
      .add('node_modules')
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

  // prettier-ignore
  webpackConfig.module
    .rule('js')
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .include.add(cwd).end()
      .exclude.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(getBabelOpts({
          config,
          env,
        }));

  // prettier-ignore
  webpackConfig.module
    .rule('js-in-node_modules')
      .test(/\.(js|mjs)$/)
      .include.add(/node_modules/).end()
      // TODO: 处理 tnpm 下 @babel/rutnime 路径变更问题
      .exclude.add(/@babel(?:\/|\\{1,2})runtime/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(getBabelDepsOpts({
          config,
          env,
        }));

  // TODO: 处理 opts.disableDynamicImport

  // prettier-ignore
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
      .loader(require.resolve('url-loader'))
      .options({
        limit: config.inlineLimit || 10000,
        name: 'static/[name].[hash:8].[ext]',
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

  // css
  css({ config, webpackConfig, isDev });

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
      .use(require('webpack/lib/IgnorePlugin'), [/^\.\/locale$/, /moment$/]);
  }

  // copy
  // TODO

  webpackConfig.when(
    isDev,
    webpackConfig => {},
    webpackConfig => {
      // don't emit files if have error
      webpackConfig.optimization.noEmitOnErrors(true);

      // don't show hints when size is too large
      webpackConfig.performance.hints(false);

      // manifest
      // TODO

      // webpack/lib/HashedModuleIdsPlugin
      // TODO

      // compress
      if (disableCompress) {
        webpackConfig.optimization.minimize(false);
      } else {
        // TODO
      }
    },
  );

  let ret = webpackConfig.toConfig();

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
