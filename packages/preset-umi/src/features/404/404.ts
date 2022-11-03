import { IApi, IRoute } from '../../types';

type Routes = Record<string, IRoute>;

export function patchRoutes(routes: Routes): Routes {
  Object.keys(routes).forEach((key) => {
    if (routes[key].path === '404') {
      routes[key].path = '*';
      routes[key].absPath = '/*';
    }
  });
  return routes;
}

export default (api: IApi) => {
  api.describe({
    key: '404',
  });
  api.modifyRoutes(async (routes: Routes) => {
    // 仅支持约定式路由
    if (api.config.routes) {
      return routes;
    }
    return patchRoutes(routes);
  });
};
