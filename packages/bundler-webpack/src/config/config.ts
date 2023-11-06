import CaseSensitivePaths from '@umijs/case-sensitive-paths-webpack-plugin';
import { logger, resolve as resolveModule } from '@umijs/utils';
import { join, resolve } from 'path';
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
import { addDependenceCssModulesDetector } from './detectCssModulesInDependence';
import { addDetectDeadCodePlugin } from './detectDeadCodePlugin';
import { addFastRefreshPlugin } from './fastRefreshPlugin';
import { addForkTSCheckerPlugin } from './forkTSCheckerPlugin';
import { addHarmonyLinkingErrorPlugin } from './harmonyLinkingErrorPlugin';
import { addIgnorePlugin } from './ignorePlugin';
import { addJavaScriptRules } from './javaScriptRules';
import { addManifestPlugin } from './manifestPlugin';
import { addMiniCSSExtractPlugin } from './miniCSSExtractPlugin';
import { addNodePolyfill } from './nodePolyfill';
import { addProgressPlugin } from './progressPlugin';
import { addSpeedMeasureWebpackPlugin } from './speedMeasureWebpackPlugin';
import addSSRPlugin from './ssrPlugin';
import { addSVGRules } from './svgRules';

export interface IOpts {
  cwd: string;
  rootDir?: string;
  env: Env;
  entry: Record<string, string>;
  extraBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelIncludes?: Array<string | RegExp>;
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
  pkg?: Record<string, any>;
  disableCopy?: boolean;
}

export async function getConfig(opts: IOpts): Promise<Configuration> {
  const { userConfig } = opts;
  const isDev = opts.env === Env.development;
  const config = new Config();
  userConfig.targets ||= DEFAULT_BROWSER_TARGETS;
  // normalize inline limit
  userConfig.inlineLimit = parseInt(userConfig.inlineLimit || '10000', 10);
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
    extraBabelIncludes: opts.extraBabelIncludes || [],
    extraEsbuildLoaderHandler: opts.extraEsbuildLoaderHandler || [],
    browsers: getBrowsersList({
      targets: userConfig.targets,
    }),
    useHash,
    staticPathPrefix:
      opts.staticPathPrefix !== undefined ? opts.staticPathPrefix : 'static/',
  };

  // name
  config.name(opts.name);

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
  const absOutputPath = resolve(
    opts.cwd,
    userConfig.outputPath || DEFAULT_OUTPUT_PATH,
  );
  const disableCompress = process.env.COMPRESS === 'none';
  config.output
    .path(absOutputPath)
    .filename(useHash ? `[name].[contenthash:8].js` : `[name].js`)
    .chunkFilename(
      useHash ? `[name].[contenthash:8].async.js` : `[name].async.js`,
    )
    .publicPath(userConfig.publicPath || 'auto')
    .pathinfo(isDev || disableCompress)
    .set(
      'assetModuleFilename',
      `${applyOpts.staticPathPrefix}[name].[hash:8][ext]`,
    )
    .set('hashFunction', 'xxhash64'); // https://github.com/webpack/webpack/issues/14532#issuecomment-947525539

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
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
        '.cjs',
        '.json',
        '.wasm'
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
  if (!opts.disableCopy) {
    await addCopyPlugin(applyOpts);
  }
  // manifest
  await addManifestPlugin(applyOpts);
  // hmr
  if (isDev && opts.hmr) {
    config.plugin('hmr').use(webpack.HotModuleReplacementPlugin);
  }
  // ssr
  await addSSRPlugin(applyOpts);
  // compress
  await addCompressPlugin(applyOpts);
  // purgecss
  // await applyPurgeCSSWebpackPlugin(applyOpts);
  // handle HarmonyLinkingError
  await addHarmonyLinkingErrorPlugin(applyOpts);
  // remove node: prefix
  // disable for performance
  // await addNodePrefixPlugin(applyOpts);
  // prevent runtime error due to css module in node modules.
  await addDependenceCssModulesDetector(applyOpts);
  // runtimePublicPath
  if (userConfig.runtimePublicPath) {
    config.plugin('runtimePublicPath').use(RuntimePublicPathPlugin);
  }
  // case-sensitive-paths
  config.plugin('case-sensitive-paths').use(CaseSensitivePaths);

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
        // 使用 rootDir 是在有 APP_ROOT 时，把 cache 目录放在根目录下
        join(
          opts.rootDir || opts.cwd,
          'node_modules',
          '.cache',
          'bundler-webpack',
        ),
    });

    // tnpm 安装依赖的情况 webpack 默认的 managedPaths 不生效
    // 使用 immutablePaths 避免 node_modules 的内容被写入缓存
    // tnpm 安装的依赖路径中同时包含包名和版本号，满足 immutablePaths 使用的条件
    // 同时配置 managedPaths 将 tnpm 的软连接结构标记为可信，避免执行快照序列化时 OOM
    // 此处通过软链的目标文件夹名称来判断 node_modules 是否为 tnpm 的 npminstall 模式
    // 因为 rapid 模式下 package.json 中没有 __npminstall_done 的标记
    // ex. node_modules/_@umijs_utils@4.0.83@@umijs/utils/package.json
    if (require.resolve('@umijs/utils/package').includes('_@umijs_utils@')) {
      const nodeModulesPath =
        opts.cache.absNodeModulesPath ||
        join(opts.rootDir || opts.cwd, 'node_modules');
      // 寻找本地 link 的 node_modules 目录，避免 NPM 包 link 场景下导致缓存生成 OOM
      const localLinkedNodeModules = Object.keys(
        Object.assign(
          {},
          opts.pkg?.dependencies,
          opts.pkg?.peerDependencies,
          opts.pkg?.devDependencies,
        ),
      )
        .map((pkg: string) => {
          try {
            return resolve(
              resolveModule.sync(`${pkg}/package.json`, {
                basedir: opts.rootDir || opts.cwd,
                preserveSymlinks: false,
              }),
              '../node_modules',
            );
          } catch {
            // will be filtered below
            return opts.rootDir || opts.cwd;
          }
        })
        .filter((pkg: string) => !pkg.startsWith(opts.rootDir || opts.cwd));

      if (localLinkedNodeModules.length) {
        logger.info(
          `Detected local linked tnpm node_modules, to avoid oom, they will be treated as immutablePaths & managedPaths in webpack snapshot:`,
        );
        localLinkedNodeModules.forEach((p) => logger.info(`  ${p}`));
      }

      config.snapshot({
        immutablePaths: [nodeModulesPath, ...localLinkedNodeModules],
        managedPaths: [nodeModulesPath, ...localLinkedNodeModules],
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
