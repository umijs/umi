import { join } from 'path';
import winPath from '../winPath';
import normalizeEntry from '../normalizeEntry';

// WIP

export default (routes, paths, requested, env, applyPlugins) => {
  // TODO: loading
  patchRoutes(routes);

  JSON.stringify(
    routes,
    (key, value) => {
      switch (key) {
        case 'component':
          break;
        case 'Route':
          return `require('${winPath(join(paths.cwd, value))}').default`;
        default:
          return value;
      }
    },
    2,
  );
};

function patchRoutes(routes, webpackChunkName) {
  routes.forEach(route => {
    patchRoute(route, webpackChunkName);
  });
}

function patchRoute(route, webpackChunkName) {
  if (!webpackChunkName) {
    webpackChunkName = normalizeEntry(route.component || 'common_component');
  }
  route.component = [route.component || 'common_component'].join('^^');
  if (route.routes) {
    patchRoutes(route.routes, webpackChunkName);
  }
}
