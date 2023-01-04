import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { esbuildExternalPlugin } from './esbuildExternalPlugin';
import path from 'path';
import { esbuildAliasPlugin } from './esbuildAliasPlugin';

export async function buildForIconExtract(opts: {
  entryPoints: string[];
  watch?: boolean;
  config?: { alias?: any };
}) {
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
    watch: !!opts.watch,
    bundle: true,
    logLevel: 'error',
    entryPoints: opts.entryPoints,
    outdir: path.join(path.dirname(opts.entryPoints[0]), 'out'),
    plugins: [
      esbuildAliasPlugin({ alias: opts.config?.alias || {} }),
      esbuildExternalPlugin(),
    ],
  });
}

// const baseDir = path.join(__dirname, '../../../fixtures/icons/normal');
// buildForIconExtract({
//   entryPoints: [path.join(baseDir, 'index.ts')],
//   config: {
//     alias: {
//       '@': path.join(baseDir, '@'),
//       'alias-1': 'alias-2',
//       'alias-3$': path.join(baseDir, 'alias-3.ts'),
//     },
//   },
// })
//   .then((res) => {
//     console.log('done', res);
//   })
//   .catch((e) => {
//     console.error(e);
//   });
