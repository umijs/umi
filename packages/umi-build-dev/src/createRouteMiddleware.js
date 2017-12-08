import { join } from 'path';
import getRouteConfig from './getRouteConfig';
import { getHTMLContent } from './generateHTML';
import { setRequest } from './requestCache';

let config = null;

export default function createRouteMiddleware(
  root,
  _config,
  plugins,
  staticDirectory,
  libraryName,
  paths,
  rebuildEntry,
) {
  config = _config;
  const { absPagesPath } = paths;
  return (req, res, next) => {
    const routeConfig = getRouteConfig(absPagesPath);
    const { pages: pagesConfig } = config;
    const path = req.path === '/' ? '/index.html' : req.path;
    if (routeConfig[path]) {
      setRequest(path, {
        onChange: rebuildEntry,
      });
      const content = getHTMLContent({
        route: path,
        entry: routeConfig[path],
        pagesPath: absPagesPath,
        root,
        pageConfig: pagesConfig && pagesConfig[path],
        plugins,
        staticDirectory,
        libraryName,
        paths,
        config,
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
