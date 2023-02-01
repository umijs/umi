import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import path from 'path';
import { esbuildAliasPlugin } from './esbuildPlugins/esbuildAliasPlugin';
import { esbuildExternalPlugin } from './esbuildPlugins/esbuildExternalPlugin';

export async function build(opts: {
  entryPoints: string[];
  watch?:
    | {
        onRebuildSuccess(): void;
      }
    | false;
  config?: { alias?: any };
  plugins?: esbuild.Plugin[];
}) {
  return await esbuild.build({
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    watch: !!opts.watch && {
      onRebuild(err) {
        if (err) {
          logger.error(`[icons] build failed: ${err}`);
        } else {
          if (opts.watch) {
            opts.watch.onRebuildSuccess();
          }
        }
      },
    },
    // do I need this?
    // incremental: true,
    bundle: true,
    logLevel: 'error',
    entryPoints: opts.entryPoints,
    write: false,
    outdir: path.join(path.dirname(opts.entryPoints[0]), 'out'),
    plugins: [
      // why externals must be in front of alias?
      // e.g.
      // if we have alias { 'foo': 'path' }
      // then we import 'foo/bar.less'
      // if we resolve alias first, we will get { path }
      // if we resolve externals first, we will get { external: true }
      esbuildExternalPlugin(),
      esbuildAliasPlugin({ alias: opts.config?.alias || {} }),
      ...(opts.plugins || []),
    ],
  });
}
