import { setRequest } from './requestCache';
import HtmlGenerator from './HtmlGenerator';

let config = null;

export default function createRouteMiddleware(service, opts = {}) {
  config = service.config;
  return (req, res, next) => {
    const { path } = req;
    const route = service.routes.filter(r => {
      return r.path === path;
    })[0];
    if (route) {
      setRequest(path, {
        onChange: opts.rebuildEntry,
      });

      const htmlGenerator = new HtmlGenerator(service);
      const content = htmlGenerator.getContent({
        pageConfig: (config.pagesConfig || {})[path],
        route,
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
