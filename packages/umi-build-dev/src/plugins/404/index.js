import { join, basename, extname } from 'path';
import { existsSync, readFileSync } from 'fs';

const EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(api) {
  const { paths } = api.service;
  const { winPath } = api.utils;

  // function get404JS() {
  //   for (const extname of EXTNAMES) {
  //     const filePath = winPath(join(paths.absPagesPath, `404${extname}`));
  //     if (existsSync(filePath)) {
  //       return filePath;
  //     }
  //   }
  // }

  function patchRoutes(routes) {
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
      console.log('spliced route', route);
      routes = routes.concat({
        component: route.component,
      });
    }
    return routes;
  }

  api.register('modifyRoutes', ({ memo }) => {
    return patchRoutes(memo);
  });

  // api.register('modifyRoutesContent', ({ memo }) => {
  //   const filePath = get404JS();
  //   if (filePath) {
  //     memo.push(`    <Route component={require('${filePath}').default} />`);
  //   }
  //   return memo;
  // });

  api.register('beforeServer', ({ args: { devServer } }) => {
    function UMI_PLUGIN_404(req, res, next) {
      if (req.accepts('html')) {
        let pageContent = readFileSync(
          join(__dirname, '../../../template/404.html'),
          'utf-8',
        );
        pageContent = pageContent
          .replace('<%= PAGES_PATH %>', paths.pagesPath)
          .replace(
            '<%= PAGES_LIST %>',
            api.service.routes
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
