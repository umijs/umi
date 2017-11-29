import { join } from 'path';
import getRouteConfig from './getRouteConfig';
import { getHTMLContent } from './generateHTML';

let config = null;

export default function createRouteMiddleware(
  root,
  _config,
  plugins,
  staticDirectory,
  libraryName,
  tmpDirectory,
  paths,
) {
  config = _config;
  const { absPagesPath } = paths;
  return (req, res, next) => {
    const routeConfig = getRouteConfig(absPagesPath, '', {
      tmpDirectory,
    });
    const { pages: pagesConfig } = config;
    const path = req.path === '/' ? '/index.html' : req.path;
    if (routeConfig[path]) {
      const content = getHTMLContent({
        route: path,
        entry: routeConfig[path],
        pagesPath: absPagesPath,
        root,
        pageConfig: pagesConfig && pagesConfig[path],
        plugins,
        staticDirectory,
        libraryName,
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
