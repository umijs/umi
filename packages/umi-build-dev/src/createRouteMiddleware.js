import matchPath from 'react-router-dom/matchPath';
import { setRequest } from './requestCache';
import HtmlGenerator from './HtmlGenerator';

let config = null;
const COMPILING_PREFIX = '/__umi_dev/compiling';

function handleUmiDev(req, res, service, opts) {
  const { path } = req;
  const routePath = path.replace(COMPILING_PREFIX, '');
  const route = service.routes.filter(r => {
    return matchPath(routePath, r);
  })[0];

  if (route) {
    // 尝试解决 Compiling... 不消失的问题
    setRequest(route.path, {
      onChange: opts.rebuildEntry,
    });
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
