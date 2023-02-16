import { rimraf } from '@umijs/utils';
import { join, resolve } from 'path';
import webpack from '../compiled/webpack';
import { getConfig, IOpts as IConfigOpts } from './config/config';
import { Env, IConfig } from './types';

type IOpts = {
  cwd: string;
  rootDir?: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  clean?: boolean;
  watch?: boolean;
} & Pick<IConfigOpts, 'cache' | 'pkg'>;

export async function build(opts: IOpts): Promise<webpack.Stats> {
  const cacheDirectoryPath = resolve(
    opts.rootDir || opts.cwd,
    opts.config.cacheDirectoryPath || 'node_modules/.cache',
  );
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: Env.production,
    entry: opts.entry,
    userConfig: opts.config,
    analyze: process.env.ANALYZE,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: [
      ...(opts.beforeBabelPlugins || []),
      ...(opts.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.beforeBabelPresets || []),
      ...(opts.extraBabelPresets || []),
    ],
    extraBabelIncludes: opts.config.extraBabelIncludes,
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    cache: opts.cache
      ? {
          ...opts.cache,
          cacheDirectory: join(cacheDirectoryPath, 'bundler-webpack'),
        }
      : undefined,
    pkg: opts.pkg,
  });
  let isFirstCompile = true;
  return new Promise((resolve, reject) => {
    if (opts.clean) {
      rimraf.sync(webpackConfig.output!.path!);
    }

    const compiler = webpack(webpackConfig);
    let closeWatching: webpack.Watching['close'];
    const handler: Parameters<typeof compiler.run>[0] = (err, stats) => {
      opts.onBuildComplete?.({
        err,
        stats,
        isFirstCompile,
        time: stats ? stats.endTime - stats.startTime : null,
        // pass close function to close watching
        ...(opts.watch ? { close: closeWatching } : {}),
      });
      isFirstCompile = false;
      if (err || stats?.hasErrors()) {
        if (err) {
          // console.error(err);
          reject(err);
        }
        if (stats) {
          const errorMsg = stats.toString('errors-only');
          // console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      } else {
        resolve(stats!);
      }

      // close compiler after normal build
      if (!opts.watch) compiler.close(() => {});
    };

    // handle watch mode
    if (opts.watch) {
      const watching = compiler.watch(
        webpackConfig.watchOptions || {},
        handler,
      );

      closeWatching = watching.close.bind(watching);
    } else {
      compiler.run(handler);
    }
  });
}
