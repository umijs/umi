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
  config: Record<string, any>;
  scripts: string[];
  esmScript?: boolean;
  modifyHTML?: (opts: { html: string; path?: string }) => Promise<string>;
}

export async function getMarkup(
  opts: Pick<IOpts, 'scripts' | 'esmScript' | 'modifyHTML' | 'config'> & {
    path?: string;
  },
) {
  // TODO: use real component
  let markup = ReactDOMServer.renderToString(
    React.createElement('div', { id: 'root' }),
  );

  function getScriptContent(script: { src?: string; content?: string }) {
    return script.src
      ? `<script${opts.esmScript ? ' type="module"' : ''} src='${
          script.src
        }'></script>`
      : `<script>${script.content}</script>`;
  }

  const favicon = opts.config.favicon
    ? `<link rel="shortcut icon" href="${opts.config.favicon}">`
    : '';
  const headScripts = normalizeScripts(opts.config.headScripts || []).map(
    getScriptContent,
  );
  const scripts = normalizeScripts(
    opts.scripts.concat(opts.config.scripts),
  ).map(getScriptContent);
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
