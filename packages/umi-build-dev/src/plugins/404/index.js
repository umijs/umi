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

      function addNotFound(_route) {
        if (!_route.routes) {
          return;
        }
        _route.routes.forEach(_r => addNotFound(_r));
        _route.routes.push(notFoundRoute);
      }

      routes.forEach(r => addNotFound(r));

      return routes;
    });
  }
}
