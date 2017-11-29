import { join } from 'path';
import getRouteConfig from './getRouteConfig';
import { getHTMLContent } from './generateHTML';
import { PAGES_PATH } from './constants';

let config = null;

export default function createRouteMiddleware(
  root,
  _config,
  plugins,
  staticDirectory,
) {
  config = _config;
  return (req, res, next) => {
    const routeConfig = getRouteConfig(join(root, PAGES_PATH));
    const { pages: pagesConfig } = config;
    const path = req.path === '/' ? '/index.html' : req.path;
    if (routeConfig[path]) {
      const content = getHTMLContent({
        route: path,
        entry: routeConfig[path],
        pagesPath: join(root, PAGES_PATH),
        root,
        pageConfig: pagesConfig && pagesConfig[path],
        plugins,
        staticDirectory,
      });
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } else {
      next();
    }
  };
}

export function setConfig(_config) {
  config = _config;
}
