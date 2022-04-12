import { MFSU, MF_DEP_PREFIX } from '@umijs/mfsu';
import { logger } from '@umijs/utils';
import { join } from 'path';
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
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  cwd: string;
  config: IConfig;
  entry: Record<string, string>;
} & Pick<IConfigOpts, 'cache'>;

export function stripUndefined(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

export async function dev(opts: IOpts) {
  const enableMFSU = opts.config.mfsu !== false;
  let mfsu: MFSU | null = null;
  if (enableMFSU) {
    if (opts.config.srcTranspiler === Transpiler.swc) {
      logger.warn(
        `Swc currently not supported for use with mfsu, recommended you use srcTranspiler: 'esbuild' in dev.`,
      );
    }
    mfsu = new MFSU({
      implementor: webpack as any,
      buildDepWithESBuild: opts.config.mfsu?.esbuild,
      depBuildConfig: {
        extraPostCSSPlugins: opts.config?.extraPostCSSPlugins || [],
      },
      mfName: opts.config.mfsu?.mfName,
      runtimePublicPath: opts.config.runtimePublicPath,
      tmpBase:
        opts.config.mfsu?.cacheDirectory ||
        join(opts.cwd, 'node_modules/.cache/mfsu'),
      onMFSUProgress: opts.onMFSUProgress,
      getCacheDependency() {
        return stripUndefined({
          version: require('../package.json').version,
          esbuildMode: !!opts.config.mfsu?.esbuild,
          alias: opts.config.alias,
          externals: opts.config.externals,
          theme: opts.config.theme,
          runtimePublicPath: opts.config.runtimePublicPath,
          publicPath: opts.config.publicPath,
        });
      },
    });
  }
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
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
    extraEsbuildLoaderHandler: mfsu?.getEsbuildLoaderHandler() || [],
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    hmr: true,
    analyze: process.env.ANALYZE,
    cache: opts.cache,
  });

  const depConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    hash: true,
    staticPathPrefix: MF_DEP_PREFIX,
    name: MFSU_NAME,
    chainWebpack: opts.config.mfsu?.chainWebpack,
    cache: {
      buildDependencies: opts.cache?.buildDependencies,
      cacheDirectory: join(opts.cwd, 'node_modules', '.cache', 'mfsu-deps'),
    },
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
    afterMiddlewares: [...(opts.afterMiddlewares || [])],
    onDevCompileDone: opts.onDevCompileDone,
    onProgress: opts.onProgress,
  });
}
