import { IApi, IRoute } from 'umi';

export function patchRoutes(routes: IRoute[], config) {
  let notFoundIndex = null;
  routes.forEach((route, index) => {
    if (route.path === '/404') {
      notFoundIndex = index;
    }
    if (route.routes) {
      patchRoutes(route.routes);
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
}

export default (api: IApi) => {
  if (process.env.NODE_ENV !== 'development') return;

  api.modifyRoutes((routes: IRoute[]) => {
    return patchRoutes(routes, api.config);
  });
};
