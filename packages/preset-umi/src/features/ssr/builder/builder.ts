import { esbuildWatchRebuildPlugin } from '@umijs/bundler-esbuild/dist/plugins/watchRebuild';
import esbuild, { BuildOptions } from '@umijs/bundler-utils/compiled/esbuild';
import { aliasUtils, isMonorepo, logger } from '@umijs/utils';
import { resolve } from 'path';
import { IApi } from '../../../types';
import { absServerBuildPath, esbuildUmiPlugin } from '../utils';
import { assetsLoader } from './assets-loader';
import { cssLoader } from './css-loader';
import { lessLoader } from './less-loader';
import svgLoader from './svg-loader';

export async function build(opts: { api: IApi; watch?: boolean }) {
  const { api, watch } = opts;
  logger.wait('[SSR] Compiling...');
  const now = new Date().getTime();

  function getExternal() {
    // TODO: 先不考虑 monorepo 的场景，因为可能依赖了其他的子包
    if (isMonorepo({ root: api.paths.cwd })) {
      return [];
    } else {
      const dependencies = Object.keys(api.pkg.dependencies || {});
      const devDependencies = Object.keys(api.pkg.devDependencies || {});
      return [...dependencies, ...devDependencies];
    }
  }

  // currently esbuild not support circle alias
  const alias = aliasUtils.parseCircleAlias({ alias: api.config.alias });

  const buildOptions: BuildOptions = {
    alias,
    format: 'cjs',
    platform: 'node',
    target: 'esnext',
    bundle: true,
    logLevel: 'silent',
    inject: [resolve(api.paths.absTmpPath, 'ssr/react-shim.js')],
    loader,
    entryPoints: [resolve(api.paths.absTmpPath, 'umi.server.ts')],
    plugins: [
      esbuildUmiPlugin(api),
      lessLoader({ cwd: api.cwd }),
      cssLoader({ cwd: api.cwd }),
      svgLoader({ cwd: api.cwd }),
      assetsLoader({ cwd: api.cwd }),
      esbuildWatchRebuildPlugin({
        onRebuild(err) {
          logger.event('[SSR] Rebuilt');
          delete require.cache[absServerBuildPath(api)];
          if (err) {
            logger.error(err);
          }
        },
      }),
    ],
    outfile: absServerBuildPath(api),
    external: getExternal(),
  };
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.rebuild();
    await ctx.watch();
  } else {
    await esbuild.build(buildOptions);
  }
  const diff = new Date().getTime() - now;
  logger.info(`[SSR] Compiled in ${diff}ms`);
}

export const loader: { [ext: string]: esbuild.Loader } = {
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
