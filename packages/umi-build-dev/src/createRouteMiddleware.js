import matchPath from 'react-router-dom/matchPath';
import { setRequest } from './requestCache';
import HtmlGenerator from './HtmlGenerator';

let config = null;

export default function createRouteMiddleware(service, opts = {}) {
  ({ config } = service);
  return (req, res, next) => {
    const { path } = req;
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

      // 尝试解决 Compiling... 不消失的问题
      setTimeout(() => {
        setRequest(route.path, {
          onChange: opts.rebuildEntry,
        });
      }, 300);

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
