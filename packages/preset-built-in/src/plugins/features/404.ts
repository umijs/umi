import { IApi, IConfig, IRoute } from '@umijs/types';

export function patchRoutes(routes: IRoute[], config: IConfig): IRoute[] {
  let notFoundIndex = null;
  routes.forEach((route, index) => {
    if (route.path === '/404') {
      notFoundIndex = index;
    }
    if (route.routes) {
      patchRoutes(route.routes, config);
    }
  });
  if (notFoundIndex !== null && !config.exportStatic) {
    const notFoundRoute = routes.slice(notFoundIndex, notFoundIndex + 1)[0];
    if (notFoundRoute.component) {
      routes.push({ component: notFoundRoute.component });
    } else if (notFoundRoute.redirect) {
      routes.push({ redirect: notFoundRoute.redirect });
    } else {
      throw new Error('Invalid route config for /404');
    }
  }
  return routes;
}

export default (api: IApi) => {
  api.describe({
    key: '404',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
  api.modifyRoutes((routes: IRoute[]) => {
    return patchRoutes(routes, api.config);
  });
};
