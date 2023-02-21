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
    const routePropsImports: string[] = [];
    const routePropsDefines: string[] = [];
    const routeIds = Object.keys(api.appData.routes);
    let index = 0;
    for (const id of routeIds) {
      const route = api.appData.routes[id];
      if (route.routeProps) {
        index += 1;
        routePropsImports.push(
          `import { routeProps as routeProps_${index} } from '${route.__absFile}';`,
        );
        routePropsDefines.push(`  '${id}': routeProps_${index},`);
      }
    }
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/routeProps.ts',
      content: `
${routePropsImports.join('\n')}
export default {
${routePropsDefines.join('\n')}
};
      `,
    });
  });

  api.onBeforeCompiler(async () => {
    await esbuild.build({
      format: 'esm',
      platform: 'browser',
      target: 'esnext',
      loader,
      watch: api.env === 'development' && {},
      bundle: true,
      logLevel: 'error',
      entryPoints: [join(api.paths.absTmpPath, 'core/routeProps.ts')],
      outfile: join(api.paths.absTmpPath, 'core/routeProps.js'),
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
