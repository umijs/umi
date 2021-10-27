import type { RequestHandler } from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import { createServerRoutes } from './routes';

interface IOpts {
  routes: Record<
    string,
    {
      path: string;
      file: string;
      id: string;
      parentId?: string;
    }
  >;
  scripts: string[];
  esmScript?: boolean;
  modifyHTML?: (opts: { html: string; path: string }) => string;
}

export function createRequestHandler(opts: IOpts): RequestHandler {
  return (req, res, next) => {
    // 匹配路由，不匹配走 next()
    // TODO: cache
    const routes = createServerRoutes({
      routesById: opts.routes,
    });
    const matches = matchRoutes(routes, req.path);
    if (matches) {
      // TODO: use real component
      let markup = ReactDOMServer.renderToString(
        React.createElement('div', { id: 'root' }),
      );
      const scripts = opts.scripts.map(
        (script) =>
          `<script${
            opts.esmScript ? ' type="module"' : ''
          } src="${script}"></script>`,
      );
      // TODO: support config
      markup = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta
  name="viewport"
  content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
/>
<meta http-equiv="X-UA-Compatible" content="ie=edge" />
</head>
<body>
${markup}
${scripts}
</body>
</html>`;
      if (opts.modifyHTML) {
        markup = opts.modifyHTML({ html: markup, path: req.path });
      }
      res.set('Content-Type', 'text/html');
      res.end(markup);
    } else {
      next();
    }
  };
}
