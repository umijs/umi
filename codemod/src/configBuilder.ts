import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { resolve } from '@umijs/utils';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const KEYS_TO_MOCK_IMPORT = ['monaco-editor-webpack-plugin'];

export async function build(opts: { configFile: string; outputFile?: string }) {
  const outfile = opts.outputFile || join(__dirname, 'config.tmp.js');
  await esbuild.build({
    format: 'cjs',
    platform: 'browser',
    target: 'esnext',
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    bundle: true,
    logLevel: 'error',
    entryPoints: [opts.configFile],
    outfile,
    plugins: [
      {
        name: 'importPlugins',
        setup(build) {
          const namespace = 'importPlugins';
          const regStr = `^(${KEYS_TO_MOCK_IMPORT.join(')|(')})$`;
          build.onResolve({ filter: new RegExp(regStr) }, (args) => ({
            path: args.path,
            namespace,
          }));
          build.onLoad({ filter: new RegExp(regStr), namespace }, () => ({
            contents: '',
          }));
        },
      },
      {
        name: 'imports',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === 'entry-point' || args.path.startsWith('/')) {
              return { path: args.path };
            } else if (args.path.startsWith('.')) {
              return {
                path: resolve.sync(args.path, {
                  basedir: args.resolveDir,
                  extensions: ['.tsx', '.ts', '.jsx', '.js'],
                }),
              };
            } else {
              return {
                path: args.path,
                external: true,
              };
            }
          });
        },
      },
    ],
  });
  const content = readFileSync(outfile, 'utf-8');
  writeFileSync(
    outfile,
    content.replace('require("umi")', '{defineConfig: (c) => c}'),
    'utf-8',
  );
}
