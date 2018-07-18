import { join } from 'path';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import assert from 'assert';
import mkdirp from 'mkdirp';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import stripJSONQuote from './routes/stripJSONQuote';
import routesToJSON from './routes/routesToJSON';
import {
  EXT_LIST,
  PLACEHOLDER_HISTORY_MODIFIER,
  PLACEHOLDER_IMPORT,
  PLACEHOLDER_RENDER,
  PLACEHOLDER_ROUTER,
  PLACEHOLDER_ROUTER_MODIFIER,
  PLACEHOLDER_ROUTES_MODIFIER,
} from './constants';

const debug = require('debug')('umi:FilesGenerator');

export default class FilesGenerator {
  constructor(service, RoutesManager) {
    this.RoutesManager = RoutesManager;
    this.service = service;
    this.routesContent = null;
    this.hasRebuildError = false;
  }

  generate() {
    const { paths } = this.service;
    const { absTmpDirPath, tmpDirPath } = paths;
    debug(`mkdir tmp dir: ${tmpDirPath}`);
    mkdirp.sync(absTmpDirPath);

    this.generateFiles();
  }

  createWatcher(path) {
    const watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../, // ignore .dotfiles
      ignoreInitial: true,
    });
    watcher.on(
      'all',
      debounce((event, path) => {
        debug(`${event} ${path}`);
        this.rebuild();
      }, 100),
    );
    return watcher;
  }

  watch() {
    if (process.env.WATCH_FILES === 'none') return;
    const {
      paths,
      config: { singular },
    } = this.service;
    const layout = singular ? 'layout' : 'layouts';
    const watcherPaths = this.service.applyPlugins('modifyPageWatchers', {
      initialValue: [
        paths.absPagesPath,
        ...EXT_LIST.map(ext => join(paths.absSrcPath, `${layout}/index${ext}`)),
      ],
    });
    this.watchers = watcherPaths.map(p => {
      return this.createWatcher(p);
    });
    process.on('SIGINT', () => {
      this.unwatch();
    });
  }

  unwatch() {
    if (this.watchers) {
      this.watchers.forEach(watcher => {
        watcher.close();
      });
    }
  }

  rebuild() {
    const {
      dev: { server },
    } = this.service;
    try {
      this.service.applyPlugins('generateFiles', {
        args: {
          isRebuild: true,
        },
      });

      this.generateRouterJS();
      this.generateEntry();

      if (this.hasRebuildError) {
        // 从出错中恢复时，刷新浏览器
        server.sockWrite(server.sockets, 'content-changed');
        this.hasRebuildError = false;
      }
    } catch (e) {
      // 向浏览器发送出错信息
      server.sockWrite(server.sockets, 'errors', [e.message]);

      this.hasRebuildError = true;
      this.routesContent = null; // why?
      debug(`Generate failed: ${e.message}`);
      debug(e);
      console.error(chalk.red(e.message));
    }
  }

  generateFiles() {
    this.service.applyPlugins('generateFiles');
    this.generateRouterJS();
    this.generateEntry();
  }

  generateEntry() {
    const { paths, entryJSTpl } = this.service;

    // Generate umi.js
    let entryContent = readFileSync(
      entryJSTpl || paths.defaultEntryTplPath,
      'utf-8',
    );
    entryContent = this.service.applyPlugins('modifyEntryFile', {
      initialValue: entryContent,
    });

    entryContent = entryContent
      .replace(PLACEHOLDER_IMPORT, '')
      .replace(PLACEHOLDER_HISTORY_MODIFIER, '')
      .replace(
        PLACEHOLDER_RENDER,
        `ReactDOM.render(React.createElement(require('./router').default), document.getElementById('root'));`,
      );
    writeFileSync(paths.absLibraryJSPath, entryContent, 'utf-8');
  }

  generateRouterJS() {
    const { paths } = this.service;
    const { absRouterJSPath } = paths;
    this.RoutesManager.fetchRoutes();

    const routesContent = this.getRouterJSContent();
    // 避免文件写入导致不必要的 webpack 编译
    if (this.routesContent !== routesContent) {
      writeFileSync(absRouterJSPath, routesContent, 'utf-8');
      this.routesContent = routesContent;
    }
  }

  getRouterJSContent() {
    const { routerTpl, paths } = this.service;
    const routerTplPath = routerTpl || paths.defaultRouterTplPath;
    assert(
      existsSync(routerTplPath),
      `routerTpl don't exists: ${routerTplPath}`,
    );

    let tplContent = readFileSync(routerTplPath, 'utf-8');
    tplContent = this.service.applyPlugins('modifyRouterFile', {
      initialValue: tplContent,
    });

    let routes = this.getRoutesJSON({
      env: process.env.NODE_ENV,
    });
    routes = stripJSONQuote(routes);

    const routerContent = this.service.applyPlugins('modifyRouterContent', {
      initialValue: this.getRouterContent(),
    });
    return tplContent
      .replace(PLACEHOLDER_IMPORT, '')
      .replace(PLACEHOLDER_ROUTER_MODIFIER, '')
      .replace(PLACEHOLDER_ROUTES_MODIFIER, '')
      .replace('<%= ROUTES %>', () => routes)
      .replace(PLACEHOLDER_ROUTER, routerContent);
  }

  fixHtmlSuffix(routes) {
    routes.forEach(route => {
      if (route.routes) {
        route.path = `${route.path}(.html)?`;
        this.fixHtmlSuffix(route.routes);
      }
    });
  }

  getRoutesJSON(opts = {}) {
    const { env } = opts;
    return routesToJSON(this.RoutesManager.routes, this.service, env);
  }

  getRouterContent() {
    return `
<Router history={window.g_history}>
  <Route render={({ location }) =>
    renderRoutes(routes, {}, { location })
  } />
</Router>
    `.trim();
  }
}
