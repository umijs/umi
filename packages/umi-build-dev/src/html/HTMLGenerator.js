import assert from 'assert';
import mkdirp from 'mkdirp';
import { dirname, join, relative } from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import isPlainObject from 'is-plain-object';
import ejs from 'ejs';
import { minify } from 'html-minifier';
import { matchRoutes } from 'react-router-config';
import formatChunksMap from './formatChunksMap';

export default class HTMLGenerator {
  constructor(opts = {}) {
    Object.keys(opts).forEach(key => {
      this[key] = opts[key];
    });
    if (this.chunksMap) {
      this.chunksMap = formatChunksMap(this.chunksMap);
    }

    if (!this.env) {
      this.env = process.env.NODE_ENV;
    }
    if (!('minify' in this)) {
      this.minify =
        this.env === 'production' && process.env.COMPRESS !== 'none';
    }
  }

  generate() {
    assert(
      this.env === 'production',
      `HtmlGenerator.generate() should only be used in umi build`,
    );

    const flatRoutes = this.getFlatRoutes(this.routes);
    assert(flatRoutes.length, 'no valid routes found');
    if (this.config.exportStatic) {
      this.exportRoutes(flatRoutes);
    } else {
      this.exportRoute(flatRoutes[0], 'index.html');
    }
  }

  routeWithoutRoutes(route) {
    const newRoute = { ...route };
    delete newRoute.routes;
    return newRoute;
  }

  getFlatRoutes(routes) {
    return routes.reduce((memo, route) => {
      if (route.routes) {
        return memo
          .concat(this.routeWithoutRoutes(route))
          .concat(this.getFlatRoutes(route.routes));
      } else {
        if (route.path) {
          memo.push(route);
        }
        return memo;
      }
    }, []);
  }

  exportRoutes(routes) {
    routes.forEach(route => {
      const content = this.getContent(route);
      const filePath = join(
        this.paths.absOutputPath,
        this.getHtmlPath(route.path),
      );
      mkdirp.sync(dirname(filePath));
      writeFileSync(filePath, content, 'utf-8');
    });
  }

  exportRoute(route, opts = {}) {
    const content = this.getContent(route);
    const filePath = join(
      this.paths.absOutputPath,
      opts.filePath || this.getHtmlPath(route.path),
    );
    mkdirp.sync(dirname(filePath));
    writeFileSync(filePath, content, 'utf-8');
  }

  getHtmlPath(path) {
    const { exportStatic } = this.config;
    const htmlSuffix =
      exportStatic && isPlainObject(exportStatic) && exportStatic.htmlSuffix;

    if (path === '/') {
      return 'index.html';
    }

    // remove first and last slash
    path = path.replace(/^\//, '');
    path = path.replace(/\/$/, '');

    if (htmlSuffix) {
      return `${path}.html`;
    } else {
      return `${path}/index.html`;
    }
  }

  getMatchedContent(path) {
    const { config } = this;
    if (config.exportStatic) {
      const branch = matchRoutes(this.routes, path).filter(r => r.path);
      const route = branch.length ? branch[branch.length - 1].route : { path };
      return this.getContent(route);
    } else {
      const flatRoutes = this.getFlatRoutes(this.routes);
      assert(flatRoutes.length, `routes should not be empty`);
      return this.getContent(flatRoutes[0]);
    }
  }

  // 获取顺序：
  // route.document > pages/document.ejs > built-in document.ejs
  getDocumentTplPath(route) {
    const { cwd, absPageDocumentPath, defaultDocumentPath } = this.paths;

    if (route.document) {
      const docPath = join(cwd, route.document);
      assert(existsSync(docPath), `document ${route.document} don't exists.`);
    }

    if (existsSync(absPageDocumentPath)) {
      return absPageDocumentPath;
    }

    return defaultDocumentPath;
  }

  getLinksContent(links) {
    return links
      .map(link => {
        return [
          '<link',
          ...Object.keys(link).reduce((memo, key) => {
            return memo.concat(`${key}="${link[key]}"`);
          }, []),
          '/>',
        ].join(' ');
      })
      .join('\n');
  }

  getMetasContent(metas) {
    return metas
      .map(meta => {
        return [
          '<meta',
          ...Object.keys(meta).reduce((memo, key) => {
            return memo.concat(`${key}="${meta[key]}"`);
          }, []),
          '/>',
        ].join(' ');
      })
      .join('\n');
  }

  getScriptsContent(scripts) {
    return scripts
      .map(script => {
        if (script.content) {
          const { content } = script;
          delete script.content;
          const attrs = Object.keys(script).reduce((memo, key) => {
            return memo.concat(`${key}="${script[key]}"`);
          }, []);
          return [
            `<script${attrs.length ? ' ' : ''}${attrs.join(' ')}>`,
            content
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n'),
            '</script>',
          ].join('\n');
        } else {
          const attrs = Object.keys(script).reduce((memo, key) => {
            return memo.concat(`${key}="${script[key]}"`);
          }, []);
          return `<script ${attrs.join(' ')}></script>`;
        }
      })
      .join('\n');
  }

  getHashedFileName(filename) {
    const isProduction = this.env === 'production';
    if (isProduction) {
      assert(
        this.chunksMap[filename],
        `file ${filename} don't exists in chunksMap`,
      );
      return this.chunksMap[filename];
    } else {
      return filename;
    }
  }

  getContent(route) {
    const { cwd } = this.paths;
    const { exportStatic, runtimePublicPath } = this.config;

    let context = {
      route,
      config: this.config,
      env: this.env,
    };
    if (this.modifyContext) context = this.modifyContext(context);

    const tplPath = this.getDocumentTplPath(route);
    const relTplPath = relative(cwd, tplPath);
    const tpl = readFileSync(tplPath, 'utf-8');

    // validate tpl
    assert(
      tpl.includes('<div id="root"></div>'),
      `Document ${relTplPath} must contain <div id="root"></div>`,
    );
    assert(
      tpl.includes('<head>') && tpl.includes('</head>'),
      `Document ${relTplPath} must contain <head> and </head>`,
    );
    assert(
      tpl.includes('<body') && tpl.includes('</body>'),
      `Document ${relTplPath} must contain <body> and </body>`,
    );

    let html = ejs.render(tpl, context, {
      _with: false,
      localsName: 'context',
    });

    let metas = [];
    let links = [];
    let scripts = [];
    let headScripts = [];

    let routerBaseStr = JSON.stringify(this.config.base || '/');
    const publicPath = this.publicPath || '/';
    let publicPathStr = JSON.stringify(publicPath);

    if (exportStatic && exportStatic.dynamicRoot) {
      routerBaseStr = `location.pathname.split('/').slice(0, -${route.path.split(
        '/',
      ).length - 1}).concat('').join('/')`;
      publicPathStr = 'location.origin + window.routerBase';
    }

    if (this.modifyRouterBase) {
      routerBaseStr = this.modifyRouterBase(routerBaseStr, { route });
    }
    if (this.modifyPublicPath) {
      publicPathStr = this.modifyPublicPath(publicPathStr);
    }

    const setPublicPath =
      runtimePublicPath || (exportStatic && exportStatic.dynamicRoot);
    headScripts.push({
      content: [
        `window.routerBase = ${routerBaseStr};`,
        ...(setPublicPath ? [`window.publicPath = ${publicPathStr};`] : []),
      ].join('\n'),
    });
    scripts.push({
      src: `<%= pathToPublicPath %>${this.getHashedFileName('umi.js')}`,
    });
    if (this.env === 'production' && this.chunksMap['umi.css']) {
      links.push({
        ref: 'stylesheet',
        href: `<%= pathToPublicPath %>${this.getHashedFileName('umi.css')}`,
      });
    }

    if (this.modifyMetas) metas = this.modifyMetas(metas);
    if (this.modifyLinks) links = this.modifyLinks(links);
    if (this.modifyScripts) scripts = this.modifyScripts(scripts);
    if (this.modifyHeadScripts)
      headScripts = this.modifyHeadScripts(headScripts);

    // insert tags
    html = html.replace(
      '<head>',
      `
<head>
${metas.length ? this.getMetasContent(metas) : ''}
${links.length ? this.getLinksContent(links) : ''}
    `.trim() + '\n',
    );
    html = html.replace(
      '</head>',
      `
${headScripts.length ? this.getScriptsContent(headScripts) : ''}
</head>
    `.trim(),
    );
    html = html.replace(
      '</body>',
      `
${scripts.length ? this.getScriptsContent(scripts) : ''}
</body>
    `.trim(),
    );

    if (this.modifyHTML) {
      html = this.modifyHTML(html, { route });
    }

    const relPathToPublicPath = this.getRelPathToPublicPath(route.path);
    const pathToPublicPath =
      exportStatic && exportStatic.dynamicRoot
        ? relPathToPublicPath
        : publicPath;
    html = html.replace(/<%= pathToPublicPath %>/g, pathToPublicPath);

    if (this.minify) {
      html = minify(html, {
        removeAttributeQuotes: false, // site don't support no quote attributes
        collapseWhitespace: true,
      });
    }

    return html;
  }

  getRelPathToPublicPath(path) {
    const htmlPath = this.getHtmlPath(path);
    const len = htmlPath.split('/').length;
    return Array(len).join('../') || './';
  }
}
