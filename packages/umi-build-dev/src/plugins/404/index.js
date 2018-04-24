import { join, basename, extname } from 'path';
import { readFileSync } from 'fs';

export function patchRoutes(routes) {
  let index = null;
  for (const [i, value] of routes.entries()) {
    const { component } = value;
    if (basename(component, extname(component)) === '404') {
      index = i;
    }
    if (value.routes) {
      value.routes = patchRoutes(value.routes);
    }
  }
  if (index !== null) {
    const route = routes.splice(index, 1)[0];
    routes = routes.concat({
      component: route.component,
    });
  }
  return routes;
}

export default function(api) {
  const { paths, config } = api.service;

  if (process.env.NODE_ENV === 'production' && !config.exportStatic) {
    api.register('modifyRoutes', ({ memo }) => {
      return patchRoutes(memo);
    });
  }

  api.register('beforeServer', ({ args: { devServer } }) => {
    function UMI_PLUGIN_404(req, res, next) {
      if (req.accepts('html')) {
        let pageContent = readFileSync(
          join(__dirname, '../../../template/404.html'),
          'utf-8',
        );
        const routes = [...api.service.routes];
        const rootRoute = routes.filter(route => route.path === '/')[0];
        if (rootRoute) {
          routes.unshift({
            ...rootRoute,
            path: '/index.html',
          });
        }
        pageContent = pageContent
          .replace('<%= PAGES_PATH %>', paths.pagesPath)
          .replace(
            '<%= PAGES_LIST %>',
            routes
              .map(route => {
                return `<li><a href="${route.path}">${route.path}</a></li>`;
              })
              .join('\r\n'),
          );
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write(pageContent);
        res.end();
      } else {
        next();
      }
    }
    devServer.use(UMI_PLUGIN_404);
  });
}
