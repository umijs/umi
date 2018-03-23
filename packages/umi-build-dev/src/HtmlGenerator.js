import { sep, join, dirname, extname } from 'path';
import ejs from 'ejs';
import { sync as mkdirp } from 'mkdirp';
import assert from 'assert';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { minify } from 'html-minifier';
import normalizeEntry from './normalizeEntry';

const debug = require('debug')('umi:HtmlGenerator');

function makeSureSlashSuffix(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

export default class HtmlGenerator {
  constructor(service, opts = {}) {
    this.service = service;
    this.chunksMap = opts.chunksMap;
  }

  /*
  // e.g.
  //
  // path  no htmlSuffix     with htmlSuffix
  // ---
  // /     /index.html       /index.html
  // /a    /a/index.html     /a.html
  // /a/   /a/index.html     /a.html
  // /a/b  /a/b/index.html   /a/b.html
  */
  getHtmlPath(path) {
    const { config } = this.service;
    const htmlSuffix =
      config.exportStatic &&
      typeof config.exportStatic === 'object' &&
      config.exportStatic.htmlSuffix;

    path = path.slice(1);
    if (path === '') {
      return 'index.html';
    }

    // remove last slash
    path = path.replace(/\/$/, '');

    if (htmlSuffix) {
      return path;
    } else {
      return `${path}/index.html`;
    }
  }

  generateForRoutes(routes) {
    const { config, paths } = this.service;
    const pagesConfig = config.pages || {};

    routes.forEach(route => {
      if (route.routes) {
        this.generateForRoutes(route.routes);
      } else {
        const { path } = route;
        const content = this.getContent({
          route,
          pageConfig: pagesConfig[path],
        });
        const outputPath = join(paths.absOutputPath, this.getHtmlPath(path));
        mkdirp(dirname(outputPath));
        writeFileSync(outputPath, content, 'utf-8');
      }
    });
  }

  // 仅在 build 时调用
  generate() {
    const { config, routes, paths } = this.service;

    if (config.exportStatic) {
      this.generateForRoutes(routes);
    } else {
      const content = this.getContent();
      const outputPath = join(paths.absOutputPath, 'index.html');
      writeFileSync(outputPath, content, 'utf-8');
    }
  }

  getContent(opts = {}) {
    const { pageConfig = {}, route = {} } = opts;
    const { paths, webpackConfig, config } = this.service;
    const { document, context = {} } = pageConfig;

    // e.g.
    // path: /user.html
    // component: ./user/page.js
    // entry: ./user
    const { component } = route;
    let { path } = route;
    const isExportStatic =
      config.exportStatic && !config.exportStatic.htmlSuffix;
    if (isExportStatic) {
      path = makeSureHaveLastSlash(path);
    }

    if (!context.path) {
      context.path = path;
    }

    const customDocPath = document
      ? join(paths.cwd, document)
      : paths.absPageDocumentPath;
    const docPath = existsSync(customDocPath)
      ? customDocPath
      : paths.defaultDocumentPath;
    const tpl = readFileSync(docPath, 'utf-8');
    let html = ejs.render(tpl, context, {
      _with: false,
      localsName: 'context',
    });

    let relPath = path
      ? new Array(path.slice(1).split(sep).length).join('../')
      : '';
    relPath = relPath === '' ? './' : relPath;

    // set publicPath
    let { publicPath } = webpackConfig.output;
    publicPath = makeSureHaveLastSlash(publicPath);
    let resourceBaseUrl = `'${publicPath}'`;
    let pathToScript = publicPath;
    debug(`publicPath: ${publicPath}`);
    if (
      !(
        publicPath.charAt(0) === '/' ||
        publicPath.indexOf('http://') === 0 ||
        publicPath.indexOf('https://') === 0 ||
        /* 变量 */ publicPath === '{{ publicPath }}'
      )
    ) {
      // 相对路径时需和 routerBase 匹配使用，否则子文件夹路由会出错
      resourceBaseUrl = `location.origin + window.routerBase + '${stripFirstSlash(
        publicPath,
      )}'`;
      pathToScript = `${relPath}${publicPath}`;
    }

    function getAssetsPath(file) {
      return `${pathToScript}${stripFirstSlash(file)}`.replace(
        /^\.\/\.\//,
        './',
      );
    }

    let routerBase;
    if (process.env.BASE_URL) {
      routerBase = JSON.stringify(process.env.BASE_URL);
    } else {
      routerBase = path
        ? `location.pathname.split('/').slice(0, -${path.split('/').length -
            1}).concat('').join('/')`
        : `'/'`;
    }
    let inlineScriptContent = `
<script>
  window.routerBase = ${routerBase};
  window.resourceBaseUrl = ${resourceBaseUrl};
</script>
    `.trim();
    inlineScriptContent = this.service.applyPlugins('modifyHTMLScript', {
      initialValue: inlineScriptContent,
    });

    const isDev = process.env.NODE_ENV === 'development';
    const cssFiles = isDev ? [] : this.getCSSFiles(component);
    const cssContent = cssFiles
      .map(file => `<link rel="stylesheet" href="${getAssetsPath(file)}" />`)
      .join('\r\n');

    const jsFiles = this.getJSFiles(component);
    const jsContent = jsFiles
      .map(file => `<script src="${getAssetsPath(file)}"></script>`)
      .join('\r\n');

    if (html.indexOf('</head>') > -1) {
      html = html.replace('</head>', `${cssContent}\r\n</head>`);
    } else {
      html = html.replace('</body>', `${cssContent}\r\n</body>`);
    }
    html = html.replace(
      '</body>',
      `${inlineScriptContent}\r\n${jsContent}\r\n</body>`,
    );

    // 插件最后处理一遍 HTML
    html = this.service.applyPlugins('modifyHTML', {
      initialValue: html,
      args: {
        route,
      },
    });

    // Minify html content
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.COMPRESS !== 'none'
    ) {
      html = minify(html, {
        removeAttributeQuotes: false, // site don't support no quote attributes
        collapseWhitespace: true,
      });
    }

    return `${html}\r\n`;
  }

  getJSFiles(component) {
    const { libraryName, config } = this.service;
    const files = [];
    try {
      files.push(this.getFile(libraryName, '.js'));
    } catch (e) {
      // do nothing
    }
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && config.exportStatic) {
      try {
        files.push(this.getFile(`__common-${libraryName}`, '.js'));
      } catch (e) {
        // do nothing
      }
      try {
        if (component) {
          files.push(this.getFile(normalizeEntry(component), '.js'));
        }
      } catch (e) {
        // do nothing
      }
    }
    return files;
  }

  getCSSFiles(component) {
    const { libraryName } = this.service;
    const files = [];
    try {
      files.push(this.getFile(libraryName, '.css'));
    } catch (e) {
      // do nothing
    }
    try {
      if (component) {
        files.push(this.getFile(normalizeEntry(component), '.css'));
      }
    } catch (e) {
      // do nothing
    }
    return files;
  }

  getFile(name, type) {
    if (!this.chunksMap) {
      return [name, type].join('');
    }

    const files = this.chunksMap[name];
    assert(
      files,
      `name ${name} don't exists in chunksMap ${JSON.stringify(
        this.chunksMap,
      )}`,
    );
    for (const file of files) {
      if (extname(file) === type) {
        return file;
      }
    }
    throw new Error(
      `getFile failed:\nmap: ${JSON.stringify(
        this.chunksMap,
      )}\nname: ${name}\ntype: ${type}`,
    );
  }
}

function stripFirstSlash(str) {
  return str.replace(/^\//, '');
}

function makeSureHaveLastSlash(str) {
  if (str === '{{ publicPath }}' || str.slice(-1) === '/') {
    return str;
  } else {
    return `${str}/`;
  }
}
