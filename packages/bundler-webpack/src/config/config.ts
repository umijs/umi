import { join } from 'path';
import webpack, { Configuration } from '../../compiled/webpack';
import Config from '../../compiled/webpack-5-chain';
import { DEFAULT_DEVTOOL, DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';
import { getBrowsersList } from '../utils/getBrowsersList';
import { applyAssetRules } from './assetRules';
import { applyCompress } from './compress';
import { applyCSSRules } from './cssRules';
import { applyDefinePlugin } from './definePlugin';
import { applyIgnorePlugin } from './ignorePlugin';
import { applyJavaScriptRules } from './javaScriptRules';
import { applyMiniCSSExtractPlugin } from './miniCSSExtractPlugin';
import { applyNodePolyfill } from './nodePolyfill';
import { applyProgressPlugin } from './progressPlugin';
import { applySpeedMeasureWebpackPlugin } from './speedMeasureWebpackPlugin';
import { applyWebpackBundleAnalyzer } from './webpackBundleAnalyzer';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts): Promise<Configuration> {
  const { userConfig } = opts;
  const isDev = opts.env === Env.development;
  const config = new Config();
  userConfig.targets = userConfig.targets || {
    chrome: 80,
  };
  const applyOpts = {
    config,
    userConfig,
    cwd: opts.cwd,
    env: opts.env,
    browsers: getBrowsersList({
      targets: userConfig.targets,
    }),
  };

  // mode
  config.mode(opts.env);

  // entry
  Object.keys(opts.entry).forEach((key) => {
    const entry = config.entry(key);
    // TODO: hot
    // TODO: runtimePublicPath
    entry.add(opts.entry[key]);
  });

  // devtool
  config.devtool(
    isDev
      ? userConfig.devtool === false
        ? false
        : userConfig.devtool || DEFAULT_DEVTOOL
      : userConfig.devtool,
  );

  // output
  const absOutputPath = join(
    opts.cwd,
    userConfig.outputPath || DEFAULT_OUTPUT_PATH,
  );
  const useHash = isDev || (userConfig.hash && !isDev);
  const disableCompress = process.env.COMPRESS === 'none';
  config.output
    .path(absOutputPath)
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(useHash ? `[name].[contenthash:8].async.js` : `[name].js`)
    .publicPath(userConfig.publicPath || '/')
    .pathinfo(isDev || disableCompress);

  // resolve
  // prettier-ignore
  config.resolve
    .set('symlinks', true)
    .modules
      .add('node_modules')
      .end()
    .alias
      .merge(userConfig.alias || {})
      .end()
    .extensions
      .merge([
        '.wasm',
        '.mjs',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json'
      ])
      .end();

  // externals
  config.externals(userConfig.externals || []);

  // target
  config.target(['web', 'es5']);

  // node polyfill
  await applyNodePolyfill(applyOpts);

  // rules
  await applyJavaScriptRules(applyOpts);
  await applyCSSRules(applyOpts);
  await applyAssetRules(applyOpts);

  // plugins
  // mini-css-extract-plugin
  await applyMiniCSSExtractPlugin(applyOpts);
  // ignoreMomentLocale
  await applyIgnorePlugin(applyOpts);
  // define
  await applyDefinePlugin(applyOpts);
  // progress
  await applyProgressPlugin(applyOpts);
  // TODO: copy
  // TODO: friendly-error
  // TODO: manifest
  // hmr
  if (isDev) {
    config.plugin('hmr').use(webpack.HotModuleReplacementPlugin);
  }
  // compress
  await applyCompress(applyOpts);
  // purgecss
  // await applyPurgeCSSWebpackPlugin(applyOpts);
  // analyzer
  await applyWebpackBundleAnalyzer(applyOpts);

  // chain webpack
  if (userConfig.chainWebpack) {
    await userConfig.chainWebpack(config, {
      env: opts.env,
      webpack: webpack,
    });
  }

  let webpackConfig = config.toConfig();

  // speed measure
  // TODO: mini-css-extract-plugin 报错
  webpackConfig = await applySpeedMeasureWebpackPlugin({
    webpackConfig,
  });

  return webpackConfig;
}
