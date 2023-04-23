import { IRoute } from '../../types';

// 临时文件中，绝对路径会带有 @fs 前缀，透过这个 esbuild 插件来忽略这个前缀
export function esbuildIgnorePathPrefixPlugin() {
  return {
    name: 'ignore-path-prefix',
    setup(build: any) {
      build.onResolve({ filter: /^@fs/ }, (args: any) => ({
        path: args.path.replace(/^@fs/, ''),
      }));
    },
  };
}

/**
 * 匹配 API 路由，包含动态路由的处理, 前后 trailing slash 的处理及 /api 前缀的处理
 *
 * 例如：`/api/users/ken20001207`, `api/users/ken20001207`,
 * `/api/users/ken20001207/`, `api/users/ken20001207/`, `users/ken20001207/`,
 * `/users/ken20001207/`, `users/ken20001207`, `/users/ken20001207` 等请求
 *
 * 都会被匹配到 `/api/users/[userId]` 这个路由中,
 * 并且 `ken20001207` 会被抽取出来放入 `params.userId` 中
 */
export function matchApiRoute(
  apiRoutes: IRoute[],
  path: string,
): { route: IRoute; params: { [key: string]: string } } | undefined {
  if (path.startsWith('/')) path = path.substring(1);
  if (path.startsWith('api/')) path = path.substring(4);

  const pathSegments = path.split('/').filter((p) => p !== '');

  if (
    pathSegments.length === 0 ||
    (pathSegments.length === 1 && pathSegments[0] === 'api')
  ) {
    const route = apiRoutes.find((r) => r.path === '/');
    if (route) return { route, params: {} };
    else return undefined;
  }

  const params: { [key: string]: string } = {};

  const route = apiRoutes.find((route) => {
    const routePathSegments = route.path.split('/').filter((p) => p !== '');

    if (routePathSegments.length !== pathSegments.length) return false;

    for (let i = 0; i < routePathSegments.length; i++) {
      const routePathSegment = routePathSegments[i];

      if (routePathSegment.match(/^\[.*]$/)) {
        params[routePathSegment.substring(1, routePathSegment.length - 1)] =
          pathSegments[i];
        if (i == routePathSegments.length - 1) return true;
        continue;
      }

      if (routePathSegment !== pathSegments[i]) return false;
      if (i == routePathSegments.length - 1) return true;
    }
  });

  if (route) return { route, params };
}
