import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import type { IApi, IRoute } from '../../../types';
import { esbuildIgnorePathPrefixPlugin } from '../utils';
import fs from 'fs';

interface VercelDynamicRouteConfig {
  page: string;
  regex: string;
  routeKeys: { [key: string]: string };
  namedRegex: string;
}

// 将 API 路由的临时文件打包为 Vercel 的 Serverless Function 可以使用的格式
export default async function (api: IApi, apiRoutes: IRoute[]) {
  const apiRoutePaths = apiRoutes.map((r) =>
    join(api.paths.absTmpPath, 'api', r.file),
  );

  await esbuild.build({
    format: 'cjs',
    platform: 'node',
    bundle: true,
    entryPoints: [
      ...apiRoutePaths,
      resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
    ],
    outdir: resolve(api.paths.cwd, '.output/server/pages/api'),
    plugins: [esbuildIgnorePathPrefixPlugin()],
  });

  const dynamicRoutes: VercelDynamicRouteConfig[] = [];

  apiRoutes.map((r) => {
    if (r.path.match(/\[.*]/)) {
      const keys = r.path
        .match(/\[.*?]/g)
        ?.map((k) => (k = k.replace(/[\[\]]/g, '')));
      const routeKeys: { [key: string]: string } = {};
      keys?.map((k) => {
        routeKeys[k] = k;
      });
      dynamicRoutes.push({
        page: '/api/' + r.path,
        regex: getVercelDynamicRoutesRegex(r.path),
        routeKeys,
        namedRegex: getVercelDynamicRoutesNamedRegex(r.path),
      });
    }
  });

  fs.writeFileSync(
    join(api.paths.cwd, '.output/routes-manifest.json'),
    JSON.stringify({ version: 3, dynamicRoutes }, null, 2),
  );
}

/**
 *  按照 Vercel 的要求将动态路由进行转换
 *
 *  若传入的 path 是
 *  `/users/[userId]/repos/[repoId]`
 *
 *  则返回的 regex 为：
 *  `^/api/users/([^/]+?)/repos/([^/]+?)(?:/)?$`
 *
 *  这个 regex 是给 Vercel 用于匹配 Serverless functions 请求的
 *  参考：https://vercel.com/docs/file-system-api#configuration/routes
 */
function getVercelDynamicRoutesRegex(path: string) {
  return '^/api/' + path.replace(/\[.*?]/g, '([^/]+?)') + '(?:/)?$';
}

/**
 *  按照 Vercel 的要求将动态路由进行转换，并且将匹配组加入别名
 *
 *  若传入的 path 是
 *  `/users/[userId]/repos/[repoId]`
 *
 *  则返回的 regex 为：
 *  `^/api/users/(?<userId>[^/]+?)/repos/(?<repoId>[^/]+?)(?:/)?$`
 *
 *  这个 regex 是给 Vercel 用于匹配 Serverless functions 请求的
 *  参考：https://vercel.com/docs/file-system-api#configuration/routes
 */
function getVercelDynamicRoutesNamedRegex(path: string) {
  return '^/api/' + path.replace(/\[(.*?)]/g, '(?<$1>[^/]+?)') + '(?:/)?$';
}
