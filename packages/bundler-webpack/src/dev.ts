import { MFSU, MF_DEP_PREFIX } from '@umijs/mfsu';
import { lodash, logger, rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Worker } from 'worker_threads';
import webpack from '../compiled/webpack';
import { getConfig, IOpts as IConfigOpts } from './config/config';
import { MFSU_NAME } from './constants';
import { createServer } from './server/server';
import { Env, IConfig, Transpiler } from './types';

type IOpts = {
  afterMiddlewares?: any[];
  beforeMiddlewares?: any[];
  onDevCompileDone?: Function;
  onProgress?: Function;
  onMFSUProgress?: Function;
  port?: number;
  host?: string;
  ip?: string;
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  cwd: string;
  rootDir?: string;
  config: IConfig;
  entry: Record<string, string>;
  mfsuStrategy?: 'eager' | 'normal';
  mfsuInclude?: string[];
  srcCodeCache?: any;
  startBuildWorker?: (deps: any[]) => Worker;
  onBeforeMiddleware?: Function;
} & Pick<IConfigOpts, 'cache' | 'pkg'>;

export function stripUndefined(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

export async function dev(opts: IOpts) {
  const cacheDirectoryPath = resolve(
    opts.rootDir || opts.cwd,
    opts.config.cacheDirectoryPath || 'node_modules/.cache',
  );
  const enableMFSU = opts.config.mfsu !== false;
  let mfsu: MFSU | null = null;

  if (enableMFSU) {
    if (opts.config.srcTranspiler === Transpiler.swc) {
      logger.warn(
        `Swc currently not supported for use with mfsu, recommended you use srcTranspiler: 'esbuild' in dev.`,
      );
    }

    mfsu = new MFSU({
      strategy: opts.mfsuStrategy,
      include: opts.mfsuInclude || [],
      srcCodeCache: opts.srcCodeCache,
      implementor: webpack as any,
      buildDepWithESBuild: opts.config.mfsu?.esbuild,
      depBuildConfig: {
        extraPostCSSPlugins: opts.config?.extraPostCSSPlugins || [],
        define: lodash.mapValues(opts.config?.define, (v) => JSON.stringify(v)),
      },
      mfName: opts.config.mfsu?.mfName,
      runtimePublicPath: opts.config.runtimePublicPath,
      tmpBase:
        opts.config.mfsu?.cacheDirectory || join(cacheDirectoryPath, 'mfsu'),
      onMFSUProgress: opts.onMFSUProgress,
      unMatchLibs: opts.config.mfsu?.exclude,
      shared: opts.config.mfsu?.shared,
      remoteAliases: opts.config.mfsu?.remoteAliases,
      remoteName: opts.config.mfsu?.remoteName,
      getCacheDependency() {
        return stripUndefined({
          version: require('../package.json').version,
          mfsu: opts.config.mfsu,
          alias: opts.config.alias,
          externals: opts.config.externals,
          theme: opts.config.theme,
          runtimePublicPath: opts.config.runtimePublicPath,
          publicPath: opts.config.publicPath,
          define: opts.config.define,
        });
      },
      startBuildWorker: opts.startBuildWorker!,
      cwd: opts.cwd!,
    });
  }

  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: [
      ...(opts.beforeBabelPlugins || []),
      ...(mfsu?.getBabelPlugins() || []),
      ...(opts.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.beforeBabelPresets || []),
      ...(opts.extraBabelPresets || []),
    ],
    extraBabelIncludes: opts.config.extraBabelIncludes,
    extraEsbuildLoaderHandler: mfsu?.getEsbuildLoaderHandler() || [],
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    hmr: process.env.HMR !== 'none',
    analyze: process.env.ANALYZE,
    cache: opts.cache
      ? {
          ...opts.cache,
          cacheDirectory: join(
            cacheDirectoryPath,
            opts.mfsuStrategy === 'eager'
              ? 'bundler-webpack-eager'
              : 'bundler-webpack',
          ),
        }
      : undefined,
    pkg: opts.pkg,
  });

  const depConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    disableCopy: true,
    hash: true,
    staticPathPrefix: MF_DEP_PREFIX,
    name: MFSU_NAME,
    chainWebpack: opts.config.mfsu?.chainWebpack,
    extraBabelIncludes: opts.config.extraBabelIncludes,
    cache: {
      buildDependencies: opts.cache?.buildDependencies,
      cacheDirectory: join(cacheDirectoryPath, 'mfsu-deps'),
    },
    pkg: opts.pkg,
  });

  webpackConfig.resolve!.alias ||= {};
  // TODO: REMOVE ME
  ['@umijs/utils/compiled/strip-ansi', 'react-error-overlay'].forEach((dep) => {
    // @ts-ignore
    webpackConfig.resolve!.alias[dep] = require.resolve(dep);
  });
  await mfsu?.setWebpackConfig({
    config: webpackConfig as any,
    depConfig: depConfig as any,
  });

  if (
    mfsu &&
    webpackConfig.cache &&
    typeof webpackConfig.cache === 'object' &&
    webpackConfig.cache.type === 'filesystem'
  ) {
    const webpackCachePath = join(
      webpackConfig.cache.cacheDirectory!,
      `default-development`,
      'index.pack',
    );
    const mfsuCacheExists = existsSync(mfsu.getCacheFilePath());
    const webpackCacheExists = existsSync(webpackCachePath);
    if (webpackCacheExists && !mfsuCacheExists) {
      logger.warn(`Invalidate webpack cache since mfsu cache is missing`);
      rimraf.sync(webpackConfig.cache.cacheDirectory!);
    }
  }

  await createServer({
    webpackConfig,
    userConfig: opts.config,
    cwd: opts.cwd,
    beforeMiddlewares: [
      ...(mfsu?.getMiddlewares() || []),
      ...(opts.beforeMiddlewares || []),
    ],
    port: opts.port,
    host: opts.host,
    ip: opts.ip,
    afterMiddlewares: [...(opts.afterMiddlewares || [])],
    onDevCompileDone: opts.onDevCompileDone,
    onProgress: opts.onProgress,
    onBeforeMiddleware: opts.onBeforeMiddleware,
  });
}
