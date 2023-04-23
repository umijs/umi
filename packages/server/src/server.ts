import type { RequestHandler } from '@umijs/bundler-utils/compiled/express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
// import { matchRoutes } from 'react-router-dom';
// import { createServerRoutes } from './routes';
import { normalizeScripts } from './scripts';
import { normalizeStyles } from './styles';

export interface IOpts {
  base: string;
  routes: Record<
    string,
    {
      path: string;
      file: string;
      id: string;
      parentId?: string;
    }
  >;
  links?: Record<string, string>[];
  metas?: Record<string, string>[];
  styles?: (Record<string, string> | string)[];
  favicons?: string[];
  title?: string;
  headScripts?: (Record<string, string> | string)[];
  scripts?: (Record<string, string> | string)[];
  mountElementId?: string;
  esmScript?: boolean;
  modifyHTML?: (html: string, args: { path?: string }) => Promise<string>;
  historyType?: 'hash' | 'browser';
}

export async function getMarkup(
  opts: Omit<IOpts, 'routes'> & {
    path?: string;
  },
) {
  // TODO: use real component
  let markup = ReactDOMServer.renderToString(
    React.createElement('div', { id: opts.mountElementId || 'root' }),
  );

  function propsToString(opts: {
    props: Record<string, any>;
    filters?: string[];
  }) {
    return Object.keys(opts.props)
      .filter((key) => {
        const isValidBoolean = opts.props[key] !== false;
        return !(opts.filters || []).includes(key) && isValidBoolean;
      })
      .map((key) => {
        const value = opts.props[key];
        // Although not has value, it will still output `key=""` after cheerio parsed
        // https://github.com/cheeriojs/cheerio/issues/1032
        if (value === true) {
          return `${key}`;
        }
        return `${key}=${JSON.stringify(value)}`;
      })
      .join(' ');
  }

  function getScriptContent(script: { src?: string; content?: string }) {
    const attrs = propsToString({
      props: script,
      filters: ['src', 'content'],
    });
    // allow specific type from config
    const isEsmScript = opts.esmScript && !('type' in script);

    return script.src
      ? `<script${isEsmScript ? ' type="module"' : ''} ${attrs} src="${
          script.src
        }"></script>`
      : `<script${isEsmScript ? ' type="module"' : ''} ${attrs}>${
          script.content
        }</script>`;
  }

  function getStyleContent(style: { src?: string; content?: string }) {
    const attrs = propsToString({
      props: style,
      filters: ['src', 'content'],
    });
    return style.src
      ? `<link rel="stylesheet" ${attrs} href="${style.src}" />`
      : `<style ${attrs}>${style.content}</style>`;
  }

  function getTagContent(opts: {
    attrs: Record<string, string>;
    tagName: string;
  }) {
    const attrs = propsToString({
      props: opts.attrs,
    });
    return `<${opts.tagName} ${attrs} />`;
  }

  function withDefaultMetas(metas: IOpts['metas'] = []) {
    const hasAttr = (key: string, value?: string) =>
      metas.some((m) => {
        return value ? m[key]?.toLowerCase() === value.toLowerCase() : m[key];
      });
    return [
      !hasAttr('charset') && { charset: 'utf-8' },
      !hasAttr('name', 'viewport') && {
        name: 'viewport',
        content:
          'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
      },
      !hasAttr('http-equiv', 'X-UA-Compatible') && {
        'http-equiv': 'X-UA-Compatible',
        content: 'ie=edge',
      },
      ...metas,
    ].filter(Boolean) as NonNullable<IOpts['metas']>;
  }

  const favicons: string[] = [];
  if (Array.isArray(opts.favicons)) {
    opts.favicons.forEach((e) => {
      favicons.push(`<link rel="shortcut icon" href="${e}">`);
    });
  }
  const title = opts.title ? `<title>${opts.title}</title>` : '';
  const metas = withDefaultMetas(opts.metas).map((meta) =>
    getTagContent({ attrs: meta, tagName: 'meta' }),
  );
  const links = (opts.links || []).map((link) =>
    getTagContent({ attrs: link, tagName: 'link' }),
  );
  const styles = normalizeStyles(opts.styles || []).map(getStyleContent);
  const headScripts = normalizeScripts(opts.headScripts || []).map(
    getScriptContent,
  );
  const scripts = normalizeScripts(opts.scripts || []).map(getScriptContent);
  markup = [
    `<!DOCTYPE html>
<html>
<head>`,
    metas.join('\n'),
    favicons.join('\n'),
    title,
    links.join('\n'),
    styles.join('\n'),
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
    markup = await opts.modifyHTML(markup, { path: opts.path });
  }
  return markup;
}

export function createRequestHandler(opts: IOpts): RequestHandler {
  return async (req, res, next) => {
    if (
      opts.historyType === 'browser' &&
      opts.base !== '/' &&
      req.path === '/' &&
      process.env.DEV_SERVER_REDIRECT !== 'none'
    ) {
      // 如果是 browser，并且配置了非 / base，访问 / 时 redirect 到 base 路径
      res.redirect(opts.base);
    } else if (
      req.headers.accept?.includes('text/html') ||
      req.headers.accept === '*/*' ||
      req.path === opts.base
    ) {
      // 匹配路由，不匹配走 next()
      // const routes = createServerRoutes({
      //   routesById: opts.routes,
      // });
      // const matches = matchRoutes(routes, req.path, opts.base);

      // 其他接受 HTML 的请求都兜底返回 HTML
      res.set('Content-Type', 'text/html');
      const markup = await getMarkup({ ...opts, path: req.path });
      res.end(markup);
    } else {
      next();
    }
  };
}
