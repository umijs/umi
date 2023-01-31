import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';

export async function extractExports(opts: {
  entry: string;
  exportName: string;
}) {
  const res = await esbuild.build({
    format: 'cjs',
    platform: 'browser',
    target: 'esnext',
    loader: {
      '.aac': 'text',
      '.css': 'text',
      '.less': 'text',
      '.sass': 'text',
      '.scss': 'text',
      '.eot': 'text',
      '.flac': 'text',
      '.gif': 'text',
      '.ico': 'text',
      '.jpeg': 'text',
      '.jpg': 'text',
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.json': 'json',
      '.md': 'jsx',
      '.mdx': 'jsx',
      '.mp3': 'text',
      '.mp4': 'text',
      '.ogg': 'text',
      '.otf': 'text',
      '.png': 'text',
      '.svg': 'text',
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.ttf': 'text',
      '.wav': 'text',
      '.webm': 'text',
      '.webp': 'text',
      '.woff': 'text',
      '.woff2': 'text',
    },
    bundle: true,
    write: false,
    entryPoints: [`${opts.entry}?entry`],
    plugins: [
      {
        name: 'virtual-entry',
        setup(build) {
          build.onResolve({ filter: /\?entry$/ }, (args) => {
            return {
              path: args.path.split('?')[0],
              namespace: 'entry',
            };
          });
          build.onResolve({ filter: /^[@a-z0-9-_~]/ }, (args) => {
            return {
              path: args.path,
              external: true,
              sideEffects: false,
            };
          });
          build.onResolve({ filter: /^\// }, (args) => {
            return {
              path: args.path,
            };
          });
          build.onLoad({ filter: /.*/, namespace: 'entry' }, (args) => {
            return {
              contents: `
import * as x from "${winPath(args.path)}";
ret = x.${opts.exportName} || {};
              `,
              loader: 'ts',
            };
          });
        },
      },
    ],
  });
  let ret: Record<string, any> = {};
  let code = res.outputFiles[0].text;
  eval(`(() => { ${code}; })();`);
  return ret;
}
