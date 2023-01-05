import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { resolve } from 'path';
import { IApi } from '../../../types';
import { absServerBuildPath, esbuildUmiPlugin } from '../utils';
import { assetsLoader } from './assets-loader';
import { cssLoader } from './css-loader';
import { lessLoader } from './less-loader';
import svgLoader from './svg-loader';
import { isMonorepo } from '../../monorepo/redirect';

export async function build(opts: { api: IApi; watch?: boolean }) {
  const { api, watch } = opts;
  logger.wait('[SSR] Compiling...');
  const now = new Date().getTime();

  function getExternal() {
    // TODO: 先不考虑 monorepo 的场景，因为可能依赖了其他的子包
    if (isMonorepo({ root: api.paths.cwd })) {
      return [];
    } else {
      return Object.keys(api.pkg.dependencies || {});
    }
  }

  // TODO: 支持通用的 alias
  // TODO: external all import from package.json.dependencies
  await esbuild.build({
    format: 'cjs',
    platform: 'node',
    target: 'esnext',
    bundle: true,
    logLevel: 'silent',
    inject: [resolve(api.paths.absTmpPath, 'ssr/react-shim.js')],
    watch: watch
      ? {
          onRebuild(err) {
            logger.event('[SSR] Rebuilt');
            delete require.cache[absServerBuildPath(api)];
            if (err) {
              logger.error(err);
            }
          },
        }
      : false,
    loader,
    entryPoints: [resolve(api.paths.absTmpPath, 'umi.server.ts')],
    plugins: [
      esbuildUmiPlugin(api),
      lessLoader({ cwd: api.cwd }),
      cssLoader({ cwd: api.cwd }),
      svgLoader({ cwd: api.cwd }),
      assetsLoader({ cwd: api.cwd }),
    ],
    outfile: absServerBuildPath(api),
    external: getExternal(),
  });
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
