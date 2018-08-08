import { join } from 'path';
import deepclone from 'lodash.clonedeep';
import { winPath } from 'umi-utils';

export default function(api) {
  const { paths } = api.service;

  if (process.env.NODE_ENV === 'development') {
    api.modifyRoutes(memo => {
      const notFoundRoute = {
        component: `
() => React.createElement(require('${winPath(
          join(__dirname, 'NotFound.js'),
        )}').default, { pagesPath: '${paths.pagesPath}' })
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
      routes.push(notFoundRoute);

      return routes;
    });
  }
}
