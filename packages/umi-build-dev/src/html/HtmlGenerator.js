import { join, dirname } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { writeFileSync } from 'fs';
import getHTMLContent from './getHTMLContent';
import getChunksMap from './getChunksMap';

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
    if (path === '' || path === 'index.html') {
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
    const { paths } = this.service;
    routes.forEach(route => {
      if (route.routes) {
        this.generateForRoutes(route.routes);
      } else {
        const { path } = route;
        const content = this.getContent(path);
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

  getContent(path) {
    const minifyHTML =
      process.env.NODE_ENV === 'production' && process.env.COMPRESS !== 'none';

    return getHTMLContent(
      path,
      this.service,
      getChunksMap(this.chunksMap),
      minifyHTML,
      process.env.NODE_ENV === 'production',
    );
  }
}
