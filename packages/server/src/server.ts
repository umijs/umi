import type { RequestHandler } from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import { createServerRoutes } from './routes';
import { normalizeScripts } from './scripts';

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
  favicon: string;
  headScripts: any[];
  scripts: any[];
  esmScript?: boolean;
  modifyHTML?: (opts: { html: string; path?: string }) => Promise<string>;
}

export async function getMarkup(
  opts: Omit<IOpts, 'routes'> & {
    path?: string;
  },
) {
  // TODO: use real component
  let markup = ReactDOMServer.renderToString(
    React.createElement('div', { id: 'root' }),
  );

  // TODO: support more script attributes
  function getScriptContent(script: { src?: string; content?: string }) {
    return script.src
      ? `<script${opts.esmScript ? ' type="module"' : ''} src='${
          script.src
        }'></script>`
      : `<script${opts.esmScript ? ' type="module"' : ''}>${
          script.content
        }</script>`;
  }

  const favicon = opts.favicon
    ? `<link rel="shortcut icon" href="${opts.favicon}">`
    : '';
  const headScripts = normalizeScripts(opts.headScripts || []).map(
    getScriptContent,
  );
  const scripts = normalizeScripts(opts.scripts || []).map(getScriptContent);
  markup = [
    `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta
  name="viewport"
  content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
/>
<meta http-equiv="X-UA-Compatible" content="ie=edge" />`,
    favicon,
    headScripts.join('\n'),
    `</head>
<body>`,
    markup,
    scripts.join('\n'),
    `</body>
</html>`,
  ]
    .filter(Boolean)
    .join('\n');
  if (opts.modifyHTML) {
    markup = await opts.modifyHTML({ html: markup, path: opts.path });
  }
  return markup;
}

export function createRequestHandler(opts: IOpts): RequestHandler {
  return async (req, res, next) => {
    // 匹配路由，不匹配走 next()
    // TODO: cache
    const routes = createServerRoutes({
      routesById: opts.routes,
    });
    const matches = matchRoutes(routes, req.path);
    if (matches) {
      res.set('Content-Type', 'text/html');
      const markup = await getMarkup({ ...opts, path: req.path });
      res.end(markup);
    } else {
      next();
    }
  };
}
