import assert from 'assert';
import { join, isAbsolute } from 'path';
import { clone } from 'lodash';
import { winPath, isUrl } from 'umi-utils';

export default (routes, pagesPath = 'src/pages', parentRoutePath = '/') => {
  return patchRoutes(routes, pagesPath, parentRoutePath);
};

function patchRoutes(routes, pagesPath, parentRoutePath) {
  assert(Array.isArray(routes), `routes should be Array, but got ${routes}`);

  return routes.map(route => {
    return patchRoute(route, pagesPath, parentRoutePath);
  });
}

function patchRoute(route, pagesPath, parentRoutePath) {
  // clone 是为了避免 patch 多次
  route = clone(route);

  // route.component start from pages
  if (route.component) {
    route.component = resolveComponent(pagesPath, route.component);
  }

  // path patch must be before bigfish patch
  if (route.path && route.path.charAt(0) !== '/') {
    if (isUrl(route.path)) {
      route.path = winPath(route.path);
    } else {
      route.path = winPath(join(parentRoutePath, route.path));
    }
  }

  // Compatible with bigfish
  if (process.env.BIGFISH_COMPAT) {
    if (route.childRoutes) {
      route.routes = route.childRoutes;
      delete route.childRoutes;
    }
    if (route.indexRoute) {
      if (route.indexRoute.redirect) {
        let { redirect } = route.indexRoute;
        if (redirect.charAt(0) !== '/') {
          redirect = winPath(join(route.path, redirect));
        }
        if (route.indexRoute.component || route.routes) {
          if (!route.routes) {
            route.routes = [];
          }
          route.routes.unshift({
            path: route.path,
            redirect,
          });
        } else {
          route.redirect = redirect;
        }
      }
      if (route.indexRoute.component) {
        if (!route.routes) {
          route.routes = [];
        }
        const parsedRoute = {
          ...route.indexRoute,
          path: route.path,
          exact: true,
          component: route.indexRoute.component,
        };
        delete parsedRoute.redirect;
        route.routes.unshift(parsedRoute);
      }
      delete route.indexRoute;
    }
  }

  if (route.redirect && route.redirect.charAt(0) !== '/') {
    route.redirect = winPath(join(parentRoutePath, route.redirect));
  }
  if (route.routes) {
    route.routes = patchRoutes(route.routes, pagesPath, route.path);
  } else if (!('exact' in route)) {
    route.exact = true;
  }

  return route;
}

function resolveComponent(pagesPath, component) {
  if (isAbsolute(component)) {
    return winPath(component);
  }
  const ret = winPath(join(pagesPath, component));
  if (ret.indexOf('./') !== 0) {
    return `./${ret}`;
  }
}
