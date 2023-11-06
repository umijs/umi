import esbuild, { BuildOptions } from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import type { IApi } from '../types';

interface IRouteExportExtractor {
  api: IApi;
  entryFile: string;
}

interface IRouteExportExtractorGenTmpFileOpts extends IRouteExportExtractor {
  propertyName: string;
}

interface IRouteExportExtractorSetupBuilderOpts extends IRouteExportExtractor {
  outFile: string;
}

type ISetupRouteExportExtractorOpts = IRouteExportExtractorGenTmpFileOpts &
  IRouteExportExtractorSetupBuilderOpts;

export function setupRouteExportExtractor(
  opts: ISetupRouteExportExtractorOpts,
) {
  const { api, entryFile, propertyName, outFile } = opts;

  api.onGenerateFiles(() => {
    generateRouteExportTmpFile({
      api,
      propertyName,
      entryFile,
    });
  });

  api.onBeforeCompiler(async () => {
    await setupExportExtractBuilder({
      api,
      entryFile,
      outFile,
    });
  });
}

function generateRouteExportTmpFile(opts: IRouteExportExtractorGenTmpFileOpts) {
  const { api, entryFile, propertyName } = opts;
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
    path: entryFile,
    content: `
${imports.join('\n')}
export default {
${defines.join('\n')}
};
    `,
  });
}

async function setupExportExtractBuilder(
  opts: IRouteExportExtractorSetupBuilderOpts,
) {
  const { api, entryFile, outFile } = opts;
  const buildOptions: BuildOptions = {
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader,
    bundle: true,
    logLevel: 'error',
    entryPoints: [join(api.paths.absTmpPath, entryFile)],
    outfile: join(api.paths.absTmpPath, outFile),
    absWorkingDir: api.cwd,
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
  };
  if (api.env === 'development') {
    const ctx = await esbuild.context(buildOptions);
    await ctx.rebuild();
    await ctx.watch();
  } else {
    await esbuild.build(buildOptions);
  }
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
