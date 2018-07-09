import pathToRegexp from 'path-to-regexp';

const routeMatchers = [];

function addToRouteMatchers(routes) {
  routes.forEach(route => {
    if (route.path && route.exact) {
      routeMatchers.push(pathToRegexp(route.path));
    }
    if (route.routes && route.routes.length) {
      addToRouteMatchers(route.routes);
    }
  });
}

export default function getRouteMatchers(routes) {
  addToRouteMatchers(routes);
  return function(location) {
    return routeMatchers.some(m => m.exec(location.pathname));
  };
}
