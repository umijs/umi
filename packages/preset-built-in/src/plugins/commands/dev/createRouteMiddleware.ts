import { IApi, NextFunction, Request, Response } from '@umijs/types';
import { extname, join } from 'path';
import { matchRoutes, RouteConfig } from 'react-router-config';
import { getHtmlGenerator } from '../htmlUtils';

const ASSET_EXTNAMES = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

export default ({
  api,
  sharedMap,
}: {
  api: IApi;
  sharedMap: Map<string, string>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function sendHtml() {
      const html = getHtmlGenerator({ api });

      let route: RouteConfig = { path: req.path };
      if (api.config.exportStatic) {
        const routes = (await api.getRoutes()) as RouteConfig[];
        const matchedRoutes = matchRoutes(routes, req.path);
        if (matchedRoutes.length) {
          route = matchedRoutes[matchedRoutes.length - 1].route;
        }
      }
      let content = await html.getContent({
        route,
        chunks: sharedMap.get('chunks'),
      });
      if (api.config.ssr && api.config.ssr?.devServerRender !== false) {
        // umi dev to enable server side render by default
        const { absOutputPath } = api.paths;
        const serverPath = join(absOutputPath || '', 'umi.server.js');
        // if dev clear cache
        if (api.env === 'development') {
          delete require.cache[serverPath];
        }

        console.time(`[SSR] render ${req.path} start`);

        const render = require(serverPath);
        const { html, error } = await render({
          // with query
          path: req.url,
          htmlTemplate: content,
          mountElementId: api.config?.mountElementId || 'root',
        });

        console.timeEnd(`[SSR] render ${req.path} start`);

        if (!error)  {
          content = html;
        }
      }
      res.setHeader('Content-Type', 'text/html');

      if (api.config.ssr && api.config.ssr?.stream) {
        content.pipe(res);
        content.on('end', function() {
          res.end();
        });
      } else {
        res.send(content);
      }
    }

    if (req.path === '/favicon.ico') {
      res.sendFile(join(__dirname, 'umi.png'));
    } else if (ASSET_EXTNAMES.includes(extname(req.path))) {
      next();
    } else {
      await sendHtml();
    }
  };
};
