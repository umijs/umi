import esbuild, { BuildResult } from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { join, resolve } from 'path';
import type { IApi, IRoute } from '../../../types';
import { OUTPUT_PATH } from '../constants';
import { esbuildIgnorePathPrefixPlugin } from '../utils';

// 将 API 路由的临时文件打包为 Umi Dev Server 可以使用的格式
export default async function (api: IApi, apiRoutes: IRoute[]) {
  const apiRoutePaths = apiRoutes.map((r) =>
    join(api.paths.absTmpPath, 'api', r.file),
  );

  const ctx = await esbuild.context({
    format: 'cjs',
    platform: 'node',
    bundle: true,
    entryPoints: [
      ...apiRoutePaths,
      resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
    ],
    outdir: resolve(api.paths.cwd, OUTPUT_PATH),
    plugins: [
      esbuildIgnorePathPrefixPlugin(),
      {
        name: 'onrebuild-plugin',
        setup(build) {
          build.onEnd((result: BuildResult) => {
            if (result.errors)
              logger.error('Compile api routes failed: ', result.errors);
            // Reload API route modules
            Object.keys(require.cache).forEach((modulePath) => {
              if (modulePath.startsWith(join(api.paths.cwd, OUTPUT_PATH)))
                delete require.cache[modulePath];
            });
          });
        },
      },
    ],
  });

  await ctx.watch();
}
