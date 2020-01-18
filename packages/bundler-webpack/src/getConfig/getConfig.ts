import { IConfig } from '@umijs/types';
import Config from 'webpack-chain';
import webpack from 'webpack';
import { join } from 'path';
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
  babelOpts?: object;
  babelOptsForDep?: object;
  targets?: any;
  browserslist?: any;
  modifyBabelOpts?: (opts: object) => Promise<any>;
  modifyBabelPresetOpts?: (opts: object) => Promise<any>;
}

export default async function({
  cwd,
  config,
  type,
  env,
  entry,
  hot,
  modifyBabelOpts,
  modifyBabelPresetOpts,
}: IOpts): Promise<webpack.Configuration> {
  const webpackConfig = new Config();

  webpackConfig.mode(env);

  // entry
  if (entry) {
    Object.keys(entry).forEach(key => {
      const e = webpackConfig.entry(key);
      if (hot) {
        e.add(require.resolve('../webpackHotDevClient/webpackHotDevClient'));
      }
      if (config.runtimePublicPath) {
        e.add(require.resolve('./setPublicPath'));
      }
      e.add(entry[key]);
    });
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
    .rule('js-in-node_modules')
      .test(/\.(js|mjs)$/)
      .include.add(/node_modules/).end()
      // TODO: 处理 tnpm 下 @babel/rutnime 路径变更问题
      .exclude.add(/@babel(?:\/|\\{1,2})runtime/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options(getBabelDepsOpts({
          env,
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
  css({ config, webpackConfig, isDev, disableCompress, browserslist });

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
  webpackConfig
    .plugin('ignore-moment-locale')
    .use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/]);

  // copy
  // TODO

  // define
  webpackConfig.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env': objToStringified({
        ...process.env,
        NODE_ENV: env,
      }),
      ...objToStringified(config.define || {}),
    },
  ]);

  webpackConfig.when(
    isDev,
    webpackConfig => {
      webpackConfig.plugin('hmr').use(webpack.HotModuleReplacementPlugin);
    },
    webpackConfig => {
      // don't emit files if have error
      webpackConfig.optimization.noEmitOnErrors(true);

      // don't show hints when size is too large
      webpackConfig.performance.hints(false);

      // manifest
      // TODO

      // webpack/lib/HashedModuleIdsPlugin
      // https://webpack.js.org/plugins/hashed-module-ids-plugin/
      webpackConfig
        .plugin('hash-module-ids')
        .use(require.resolve('webpack/lib/HashedModuleIdsPlugin'));

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

  let ret = webpackConfig.toConfig() as webpack.Configuration;

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
