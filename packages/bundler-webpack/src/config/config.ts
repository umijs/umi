import { join } from 'path';
import webpack, { Configuration } from '../../compiled/webpack';
import Config from '../../compiled/webpack-5-chain';
import { DEFAULT_DEVTOOL, DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';
import { getBrowsersList } from '../utils/browsersList';
import { addAssetRules } from './assetRules';
import { addBundleAnalyzerPlugin } from './bundleAnalyzerPlugin';
import { addCompressPlugin } from './compressPlugin';
import { addCSSRules } from './cssRules';
import { addDefinePlugin } from './definePlugin';
import { addIgnorePlugin } from './ignorePlugin';
import { addJavaScriptRules } from './javaScriptRules';
import { addMiniCSSExtractPlugin } from './miniCSSExtractPlugin';
import { addNodePolyfill } from './nodePolyfill';
import { addProgressPlugin } from './progressPlugin';
import { addSpeedMeasureWebpackPlugin } from './speedMeasureWebpackPlugin';

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
    if (isDev) {
      entry.add(require.resolve('../client/client'));
    }
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
  const useHash = userConfig.hash && !isDev;
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
  await addNodePolyfill(applyOpts);

  // rules
  await addJavaScriptRules(applyOpts);
  await addCSSRules(applyOpts);
  await addAssetRules(applyOpts);

  // plugins
  // mini-css-extract-plugin
  await addMiniCSSExtractPlugin(applyOpts);
  // ignoreMomentLocale
  await addIgnorePlugin(applyOpts);
  // define
  await addDefinePlugin(applyOpts);
  // progress
  await addProgressPlugin(applyOpts);
  // TODO: copy
  // TODO: friendly-error
  // TODO: manifest
  // hmr
  if (isDev) {
    config.plugin('hmr').use(webpack.HotModuleReplacementPlugin);
  }
  // compress
  await addCompressPlugin(applyOpts);
  // purgecss
  // await applyPurgeCSSWebpackPlugin(applyOpts);
  // analyzer
  await addBundleAnalyzerPlugin(applyOpts);

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
  webpackConfig = await addSpeedMeasureWebpackPlugin({
    webpackConfig,
  });

  return webpackConfig;
}
