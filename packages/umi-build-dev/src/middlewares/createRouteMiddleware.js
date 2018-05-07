import matchPath from 'react-router-dom/matchPath';
import HtmlGenerator from '../HtmlGenerator';

let config = null;

export default function createRouteMiddleware(service) {
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

      const htmlGenerator = new HtmlGenerator(service);
      const gcOpts = config.exportStatic
        ? {
            pageConfig: (config.pages || {})[path],
            route: { path: req.path },
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
