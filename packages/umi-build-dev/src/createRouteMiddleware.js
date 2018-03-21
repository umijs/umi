import matchPath from 'react-router-dom/matchPath';
import { matchRoutes } from 'react-router-config';
import { setRequest } from './requestCache';
import HtmlGenerator from './HtmlGenerator';

let config = null;
const COMPILING_PREFIX = '/__umi_dev/compiling';

function handleUmiDev(req, res, service, opts) {
  const { path } = req;
  const routePath = path.replace(COMPILING_PREFIX, '');
  const routes = matchRoutes(service.routes, routePath);

  if (routes && routes.length) {
    routes.forEach(({ route }) => {
      setRequest(route.path);
    });
    opts.rebuildEntry();
  }

  res.end('done');
}

export default function createRouteMiddleware(service, opts = {}) {
  ({ config } = service);

  return (req, res, next) => {
    const { path } = req;

    if (path.startsWith(COMPILING_PREFIX)) {
      return handleUmiDev(req, res, service, opts);
    }

    const route = service.routes.filter(r => {
      return matchPath(path, r);
    })[0];

    if (route) {
      service.applyPlugins('onRouteRequest', {
        args: {
          route,
          req,
        },
      });

      const htmlGenerator = new HtmlGenerator(service);
      const gcOpts = config.exportStatic
        ? {
            pageConfig: (config.pages || {})[path],
            route,
          }
        : {};
      const content = htmlGenerator.getContent(gcOpts);
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
