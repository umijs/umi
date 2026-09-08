import { chalk, importLazy, rimraf } from '@umijs/utils';
import { join, resolve } from 'path';
import webpack from '../compiled/webpack';
import type { IOpts as IConfigOpts } from './config/config';
import { Env, IConfig } from './types';

const configModule: typeof import('./config/config') = importLazy(
  require.resolve('./config/config'),
);

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
  disableCopy?: boolean;
} & Pick<IConfigOpts, 'cache' | 'pkg'>;

export async function build(opts: IOpts): Promise<webpack.Stats> {
  const cacheDirectoryPath = resolve(
    opts.rootDir || opts.cwd,
    opts.config.cacheDirectoryPath || 'node_modules/.cache',
  );
  const webpackConfig = await configModule.getConfig({
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
    disableCopy: opts.disableCopy,
  });
  let isFirstCompile = true;
  return new Promise((resolve, reject) => {
    if (opts.clean) {
      rimraf.sync(webpackConfig.output!.path!);
    }

    const compiler = webpack(webpackConfig);
    let closeWatching: webpack.Watching['close'];
    const handler: Parameters<typeof compiler.run>[0] = async (err, stats) => {
      // generate valid error from normal error and stats error
      const validErr =
        err ||
        (stats?.hasErrors() ? new Error(stats!.toString('errors-only')) : null);

      await opts.onBuildComplete?.({
        err: validErr,
        stats,
        isFirstCompile,
        time: stats ? stats.endTime - stats.startTime : null,
        // pass close function to close watching
        ...(opts.watch ? { close: closeWatching } : {}),
      });
      isFirstCompile = false;
      if (validErr) {
        // try to catch esbuild minify error to output  friendly error message
        stats?.hasErrors() && esbuildCompressErrorHelper(validErr.toString());
        reject(validErr);
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

function esbuildCompressErrorHelper(errorMsg: string) {
  if (typeof errorMsg !== 'string') return;
  if (
    // https://github.com/evanw/esbuild/blob/a5f781ecd5edeb3fb6ae8d1045507ab850462614/internal/js_parser/js_parser_lower.go#L18
    errorMsg.includes('configured target environment') &&
    errorMsg.includes('es2015')
  ) {
    const terserRecommend = {
      label: chalk.green('change jsMinifier'),
      details: chalk.cyan(`  jsMinifier: 'terser'`),
    };
    const upgradeTargetRecommend = {
      label: chalk.green('upgrade target'),
      details: chalk.cyan(`  jsMinifierOptions: {
    target: ['chrome80', 'es2020']
  }`),
    };
    const ieRecommend = {
      details: `P.S. compatible with legacy browsers: https://umijs.org/blog/legacy-browser`,
    };
    console.log();
    console.log(chalk.bgRed(' COMPRESSION ERROR '));
    console.log(
      chalk.yellow(
        `esbuild minify failed, please ${terserRecommend.label} or ${upgradeTargetRecommend.label}:`,
      ),
    );
    console.log('e.g. ');
    console.log(terserRecommend.details);
    console.log('   or');
    console.log(upgradeTargetRecommend.details);
    console.log(ieRecommend.details);
    console.log();
  }
}
