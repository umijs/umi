import { join } from 'path';
import webpack, { Configuration } from '../../compiled/webpack';
import Config from '../../compiled/webpack-5-chain';
import {
  DEFAULT_BROWSER_TARGETS,
  DEFAULT_DEVTOOL,
  DEFAULT_OUTPUT_PATH,
} from '../constants';
import { RuntimePublicPathPlugin } from '../plugins/RuntimePublicPathPlugin';
import { Env, IConfig } from '../types';
import { getBrowsersList } from '../utils/browsersList';
import { addAssetRules } from './assetRules';
import { addBundleAnalyzerPlugin } from './bundleAnalyzerPlugin';
import { addCompressPlugin } from './compressPlugin';
import { addCopyPlugin } from './copyPlugin';
import { addCSSRules } from './cssRules';
import { addDefinePlugin } from './definePlugin';
import { addDetectDeadCodePlugin } from './detectDeadCodePlugin';
import { addFastRefreshPlugin } from './fastRefreshPlugin';
import { addForkTSCheckerPlugin } from './forkTSCheckerPlugin';
import { addHarmonyLinkingErrorPlugin } from './harmonyLinkingErrorPlugin';
import { addIgnorePlugin } from './ignorePlugin';
import { addJavaScriptRules } from './javaScriptRules';
import { addManifestPlugin } from './manifestPlugin';
import { addMiniCSSExtractPlugin } from './miniCSSExtractPlugin';
import { addNodePolyfill } from './nodePolyfill';
import { addNodePrefixPlugin } from './nodePrefixPlugin';
import { addProgressPlugin } from './progressPlugin';
import { addSpeedMeasureWebpackPlugin } from './speedMeasureWebpackPlugin';
import { addSVGRules } from './svgRules';

export interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  extraBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraEsbuildLoaderHandler?: any[];
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  hash?: boolean;
  hmr?: boolean;
  staticPathPrefix?: string;
  userConfig: IConfig;
  analyze?: any;
  name?: string;
  cache?: {
    absNodeModulesPath?: string;
    buildDependencies?: string[];
    cacheDirectory?: string;
  };
}

export async function getConfig(opts: IOpts): Promise<Configuration> {
  const { userConfig } = opts;
  const isDev = opts.env === Env.development;
  const config = new Config();
  userConfig.targets ||= DEFAULT_BROWSER_TARGETS;
  const useHash = !!(opts.hash || (userConfig.hash && !isDev));
  const applyOpts = {
    name: opts.name,
    config,
    userConfig,
    cwd: opts.cwd,
    env: opts.env,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: opts.extraBabelPlugins || [],
    extraBabelPresets: opts.extraBabelPresets || [],
    extraEsbuildLoaderHandler: opts.extraEsbuildLoaderHandler || [],
    browsers: getBrowsersList({
      targets: userConfig.targets,
    }),
    useHash,
    staticPathPrefix:
      opts.staticPathPrefix !== undefined ? opts.staticPathPrefix : 'static/',
  };

  // mode
  config.mode(opts.env);
  config.stats('none');

  // entry
  Object.keys(opts.entry).forEach((key) => {
    const entry = config.entry(key);
    if (isDev && opts.hmr) {
      entry.add(require.resolve('../../client/client/client'));
    }
    entry.add(opts.entry[key]);
  });

  // devtool
  config.devtool(
    isDev
      ? userConfig.devtool === false
        ? false
        : userConfig.devtool || DEFAULT_DEVTOOL
      : userConfig.devtool!,
  );

  // output
  const absOutputPath = join(
    opts.cwd,
    userConfig.outputPath || DEFAULT_OUTPUT_PATH,
  );
  const disableCompress = process.env.COMPRESS === 'none';
  config.output
    .path(absOutputPath)
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(useHash ? `[name].[contenthash:8].async.js` : `[name].js`)
    .publicPath(userConfig.publicPath || 'auto')
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

  // experiments
  config.experiments({
    topLevelAwait: true,
    outputModule: !!userConfig.esm,
  });

  // node polyfill
  await addNodePolyfill(applyOpts);

  // rules
  await addJavaScriptRules(applyOpts);
  await addCSSRules(applyOpts);
  await addAssetRules(applyOpts);
  await addSVGRules(applyOpts);

  // plugins
  // mini-css-extract-plugin
  await addMiniCSSExtractPlugin(applyOpts);
  // ignoreMomentLocale
  await addIgnorePlugin(applyOpts);
  // define
  await addDefinePlugin(applyOpts);
  // fast refresh
  await addFastRefreshPlugin(applyOpts);
  // progress
  await addProgressPlugin(applyOpts);
  // detect-dead-code-plugin
  await addDetectDeadCodePlugin(applyOpts);
  // fork-ts-checker
  await addForkTSCheckerPlugin(applyOpts);
  // copy
  await addCopyPlugin(applyOpts);
  // manifest
  await addManifestPlugin(applyOpts);
  // hmr
  if (isDev && opts.hmr) {
    config.plugin('hmr').use(webpack.HotModuleReplacementPlugin);
  }
  // compress
  await addCompressPlugin(applyOpts);
  // purgecss
  // await applyPurgeCSSWebpackPlugin(applyOpts);
  // handle HarmonyLinkingError
  await addHarmonyLinkingErrorPlugin(applyOpts);
  // remove node: prefix
  await addNodePrefixPlugin(applyOpts);
  // runtimePublicPath
  if (userConfig.runtimePublicPath) {
    config.plugin('runtimePublicPath').use(RuntimePublicPathPlugin);
  }

  // cache
  if (opts.cache) {
    config.cache({
      type: 'filesystem',
      version: require('../../package.json').version,
      buildDependencies: {
        config: opts.cache.buildDependencies || [],
      },
      cacheDirectory:
        opts.cache.cacheDirectory ||
        join(opts.cwd, 'node_modules', '.cache', 'bundler-webpack'),
    });

    // tnpm 安装依赖的情况 webpack 默认的 managedPaths 不生效
    // 使用 immutablePaths 避免 node_modules 的内容被写入缓存
    // tnpm 安装的依赖路径中同时包含包名和版本号，满足 immutablePaths 使用的条件
    // ref: smallfish
    if (/*isTnpm*/ require('@umijs/utils/package').__npminstall_done) {
      config.snapshot({
        immutablePaths: [
          opts.cache.absNodeModulesPath || join(opts.cwd, 'node_modules'),
        ],
      });
    }

    config.infrastructureLogging({
      level: 'error',
      ...(process.env.WEBPACK_FS_CACHE_DEBUG
        ? {
            debug: /webpack\.cache/,
          }
        : {}),
    });
  }

  // analyzer
  if (opts.analyze) {
    await addBundleAnalyzerPlugin(applyOpts);
  }

  // chain webpack
  if (opts.chainWebpack) {
    await opts.chainWebpack(config, {
      env: opts.env,
      webpack,
    });
  }
  if (userConfig.chainWebpack) {
    await userConfig.chainWebpack(config, {
      env: opts.env,
      webpack,
    });
  }

  let webpackConfig = config.toConfig();

  // speed measure
  // TODO: mini-css-extract-plugin 报错
  webpackConfig = await addSpeedMeasureWebpackPlugin({
    webpackConfig,
  });

  if (opts.modifyWebpackConfig) {
    webpackConfig = await opts.modifyWebpackConfig(webpackConfig, {
      env: opts.env,
      webpack,
    });
  }

  return webpackConfig;
}
