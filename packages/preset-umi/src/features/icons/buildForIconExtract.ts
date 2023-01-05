import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { esbuildExternalPlugin } from './esbuildExternalPlugin';
import path from 'path';
import { esbuildAliasPlugin } from './esbuildAliasPlugin';
import { esbuildCollectIconPlugin } from './esbuildCollectIconPlugin';
import { logger } from '@umijs/utils';

export async function buildForIconExtract(opts: {
  entryPoints: string[];
  watch?:
    | {
        onRebuildSuccess(): void;
      }
    | false;
  config?: { alias?: any };
}) {
  const icons: Set<string> = new Set();
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
