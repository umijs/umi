import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { resolve } from 'path';
import type { IApi } from '../../../types';
import { esbuildIgnorePathPrefixPlugin } from '../utils';

// 将 API 路由的临时文件打包为 Vercel 的 Serverless Function 可以使用的格式
export default async function (api: IApi, apiRoutePaths: string[]) {
  await esbuild.build({
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    bundle: true,
    entryPoints: [
      ...apiRoutePaths,
      resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
    ],
    outdir: resolve(api.paths.cwd, '.output/server/pages/api'),
    plugins: [esbuildIgnorePathPrefixPlugin()],
  });
}
