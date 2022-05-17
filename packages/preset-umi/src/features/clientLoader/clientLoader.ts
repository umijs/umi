import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    const clientLoaderImports: string[] = [];
    const clientLoaderDefines: string[] = [];
    const routeIds = Object.keys(api.appData.routes);
    let index = 0;
    for (const id of routeIds) {
      const route = api.appData.routes[id];
      if (route.__hasClientLoader) {
        index += 1;
        clientLoaderImports.push(
          `import { clientLoader as loader_${index} } from '${route.__absFile}';`,
        );
        clientLoaderDefines.push(`  '${id}': loader_${index},`);
      }
    }
    api.writeTmpFile({
      noPluginDir: true,
      path: join('core/loaders.ts'),
      content: `
${clientLoaderImports.join('\n')}
export default {
${clientLoaderDefines.join('\n')}
};
      `,
    });
  });

  // 把 core/loader.ts (在 tmpFile.ts 的 onGenerateFiles 产生的) 编译成 core/loader.js
  // core/loader.js 会被 core/route.ts 引用，将每个 route 的 clientLoader 注入进去
  api.onBeforeCompiler(async () => {
    await esbuild.build({
      format: 'esm',
      platform: 'browser',
      target: 'esnext',
      loader,
      watch: api.env === 'development' && {},
      bundle: true,
      logLevel: 'error',
      entryPoints: [join(api.paths.absTmpPath, 'core/loaders.ts')],
      outfile: join(api.paths.absTmpPath, 'core/loaders.js'),
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
  });
};

const loader: { [ext: string]: esbuild.Loader } = {
  '.aac': 'file',
  '.css': 'text',
  '.less': 'text',
  '.sass': 'text',
  '.scss': 'text',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.ico': 'file',
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
