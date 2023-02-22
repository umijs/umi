import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import type { IApi } from 'umi';

export function generateRouteExportTmpFile(
  api: IApi,
  propertyName: string,
  filePath: string,
) {
  const imports: string[] = [];
  const defines: string[] = [];
  const routeIds = Object.keys(api.appData.routes);
  let index = 0;
  for (const id of routeIds) {
    const route = api.appData.routes[id];
    if (route[propertyName]) {
      index += 1;
      imports.push(
        `import { ${propertyName} as ${propertyName}_${index} } from '${route.__absFile}';`,
      );
      defines.push(`  '${id}': ${propertyName}_${index},`);
    }
  }

  api.writeTmpFile({
    noPluginDir: true,
    path: filePath,
    content: `
${imports.join('\n')}
export default {
${defines.join('\n')}
};
    `,
  });
}

export async function setupExportExtractBuilder(
  api: IApi,
  filePath: string,
  outfile: string,
) {
  await esbuild.build({
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader,
    watch: api.env === 'development' && {},
    bundle: true,
    logLevel: 'error',
    entryPoints: [join(api.paths.absTmpPath, filePath)],
    outfile: join(api.paths.absTmpPath, outfile),
    plugins: [
      {
        name: 'imports',
        setup(build) {
          let entry: string | undefined;
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === 'entry-point') entry = args.path;
            if (args.kind === 'entry-point' || args.importer === entry) {
              return { path: resolve(args.resolveDir, args.path) };
            }
            return {
              path:
                !args.path.startsWith('.') && !args.path.startsWith('/')
                  ? args.path
                  : resolve(args.resolveDir, args.path),
              external: true,
              sideEffects: false,
            };
          });
        },
      },
    ],
  });
}

const loader: { [ext: string]: esbuild.Loader } = {
  '.aac': 'file',
  '.css': 'text',
  '.less': 'text',
  '.sass': 'text',
  '.scss': 'text',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.htm': 'file',
  '.html': 'file',
  '.ico': 'file',
  '.icon': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'jsx',
  '.mdx': 'jsx',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
};
