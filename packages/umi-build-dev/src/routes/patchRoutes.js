import deprecate from 'deprecate';

export default (routes, config = {}, isProduction) => {
  patchRoutes(routes, config, isProduction);
  return routes;
};

function patchRoutes(routes, config, isProduction) {
  let notFoundIndex = null;
  routes.forEach((route, index) => {
    patchRoute(route, config, isProduction);
    if (route.path === '/404') {
      notFoundIndex = index;
    }
  });

  // Transform /404 to fallback route in production and exportStatic is not set
  if (notFoundIndex !== null && isProduction && !config.exportStatic) {
    const notFoundRoute = routes.splice(notFoundIndex, 1)[0];
    routes.push({ component: notFoundRoute.component });
  }
}

function patchRoute(route, config, isProduction) {
  const isDynamicRoute = route.path.indexOf('/:') > -1;
  if (config.exportStatic && isDynamicRoute) {
    throw new Error(
      `you should not use exportStatic with dynamic route: ${route.path}`,
    );
  }

  // /path -> /path.html
  if (config.exportStatic && config.exportStatic.htmlSuffix) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  }

  // TODO: use config from config.routes
  if (
    config.pages &&
    config.pages[route.path] &&
    config.pages[route.path].Route
  ) {
    route.Route = config.pages[route.path].Route;
  }

  // Compatible the meta.Route and warn deprecated
  if (route.meta && route.meta.Route) {
    deprecate('route.meta.Route is deprecated, use route.Route instead');
    route.Route = route.meta.Route;
    delete route.meta;
  }

  if (route.routes) {
    patchRoutes(route.routes, config, isProduction);
  }
}

function addHtmlSuffix(path, hasRoutes) {
  if (path === '/') return path;
  if (hasRoutes) {
    return path;
  } else {
    return path.endsWith('/') ? `${path.slice(0, -1)}.html` : `${path}.html`;
  }
}
