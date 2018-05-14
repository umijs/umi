import { join } from 'path';
import deepclone from 'lodash.clonedeep';

export default function(api) {
  const { paths } = api.service;
  const { winPath } = api.utils;

  if (process.env.NODE_ENV === 'development') {
    api.register('modifyRoutes', ({ memo }) => {
      const notFoundRoute = {
        component: `
() => React.createElement(require('${winPath(
          join(__dirname, 'NotFound.js'),
        )}').default, { pagesPath: '${
          paths.pagesPath
        }', routes: '${JSON.stringify(memo).replace(/\"/g, '^')}' })
        `.trim(),
      };
      const routes = deepclone(memo);
      const globalLayoutRoute = routes.filter(route => {
        return route.path === '/' && route.exact !== true;
      })[0];
      if (globalLayoutRoute) {
        globalLayoutRoute.routes = [
          ...(globalLayoutRoute.routes || []),
          notFoundRoute,
        ];
        return routes;
      } else {
        return [...routes, notFoundRoute];
      }
    });
  }
}
