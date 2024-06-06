import { esbuildWatchRebuildPlugin } from '@umijs/bundler-esbuild/dist/plugins/watchRebuild';
import esbuild, {
  BuildContext,
  BuildOptions,
  BuildResult,
} from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { existsSync } from 'fs';
import path from 'path';
import { possibleExtUsingEmptyLoader } from '../../libs/folderCache/constant';
import { esbuildAliasPlugin } from './esbuildPlugins/esbuildAliasPlugin';
import { esbuildExternalPlugin } from './esbuildPlugins/esbuildExternalPlugin';

export async function build(opts: {
  entryPoints: string[];
  watch?:
    | {
        onRebuildSuccess({ result }: { result: esbuild.BuildResult }): void;
      }
    | false;
  config: { alias?: any; cwd: string };
  plugins?: esbuild.Plugin[];
  write?: boolean;
}): Promise<[BuildResult, BuildContext | undefined]> {
  const outdir = path.join(path.dirname(opts.entryPoints[0]), 'out');
  const alias = opts.config?.alias || {};
  const tsconfig = existsSync(path.join(opts.config.cwd, 'tsconfig.json'))
    ? 'tsconfig.json'
    : undefined;

  const buildOptions: BuildOptions = {
    // 需要指定 absWorkingDir 兼容 APP_ROOT 的情况
    absWorkingDir: opts.config.cwd,
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader: {
      // use tsx loader for js/jsx/ts/tsx files
      // since only ts support paramDecorator
      ...possibleExtUsingEmptyLoader,
      '.js': 'tsx',
      '.jsx': 'tsx',
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    tsconfig,
    // do I need this?
    // incremental: true,
    bundle: true,
    logLevel: 'error',
    entryPoints: opts.entryPoints,
    write: opts.write || false,
    outdir,
    metafile: true,
    plugins: [
      // why externals must be in front of alias?
      // e.g.
      // if we have alias { 'foo': 'path' }
      // then we import 'foo/bar.less'
      // if we resolve alias first, we will get { path }
      // if we resolve externals first, we will get { external: true }
      esbuildExternalPlugin({ alias }),
      esbuildAliasPlugin({ alias }),
      esbuildWatchRebuildPlugin({
        onRebuild(err, result) {
          if (err) {
            logger.error(`[icons] build failed: ${err}`);
          } else {
            if (opts.watch) {
              opts.watch.onRebuildSuccess({ result: result! });
            }
          }
        },
      }),
      ...(opts.plugins || []),
    ],
  };
  if (opts.watch) {
    const ctx = await esbuild.context(buildOptions);
    const result = await ctx.rebuild();
    await ctx.watch();
    return [result, ctx];
  } else {
    const result = await esbuild.build(buildOptions);
    return [result, undefined];
  }
}
