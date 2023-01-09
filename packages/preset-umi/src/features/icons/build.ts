import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { esbuildExternalPlugin } from './esbuildPlugins/esbuildExternalPlugin';
import path from 'path';
import { esbuildAliasPlugin } from './esbuildPlugins/esbuildAliasPlugin';
import { esbuildCollectIconPlugin } from './esbuildPlugins/esbuildCollectIconPlugin';
import { logger } from '@umijs/utils';

export async function build(opts: {
  entryPoints: string[];
  watch?:
    | {
        onRebuildSuccess(): void;
      }
    | false;
  config?: { alias?: any };
  options?: { alias?: Record<string, string> };
  icons?: Set<string>;
}) {
  const icons: Set<string> = opts.icons || new Set();
  await esbuild.build({
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
      esbuildAliasPlugin({ alias: opts.config?.alias || {} }),
      esbuildExternalPlugin(),
      esbuildCollectIconPlugin({
        icons,
        alias: opts.options?.alias || {},
      }),
    ],
  });
  return icons;
}

// const baseDir = path.join(__dirname, '../../../fixtures/icons/normal');
// buildForIconExtract({
//   entryPoints: [path.join(baseDir, 'index.tsx')],
//   config: {
//     alias: {
//       '@': path.join(baseDir, '@'),
//       'alias-1': 'alias-2',
//       'alias-3$': path.join(baseDir, 'alias-3.ts'),
//     },
//   },
//   watch: {
//     onRebuildSuccess(icons) {
//       console.log('icons', icons);
//     },
//   },
// })
//   .then((icons) => {
//     console.log('done');
//     console.log(icons);
//   })
//   .catch((e) => {
//     console.error(e);
//   });
