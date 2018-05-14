import assert from 'assert';
import { join } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import { matchRoutes } from 'react-router-config';
import getRouteConfig from './routes/getRouteConfig';
import stripJSONQuote from './routes/stripJSONQuote';
import routesToJSON from './routes/routesToJSON';
import { getRequest } from './requestCache';
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
  constructor(service) {
    this.service = service;
    this.routesContent = null;
    this.hasRebuildError = false;
    this.layoutDirectoryName = service.config.singular ? 'layout' : 'layouts';
  }

  generate(opts = {}) {
    const { paths } = this.service;
    const { absTmpDirPath, tmpDirPath } = paths;
    debug(`Mkdir tmp dir: ${tmpDirPath}`);
    mkdirp(absTmpDirPath);

    this.generateFiles();
    if (opts.onChange) opts.onChange();
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
    const { paths } = this.service;
    const watcherPaths = this.service.applyPlugins('modifyPageWatchers', {
      initialValue: [
        paths.absPagesPath,
        join(paths.absSrcPath, '_routes.json'),
        ...EXT_LIST.map(ext =>
          join(paths.absSrcPath, `${this.layoutDirectoryName}/index${ext}`),
        ),
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
    const { devServer } = this.service;
    try {
      this.service.applyPlugins('generateFiles', {
        args: {
          isRebuild: true,
        },
      });

      this.generateRouterJS();
      this.generateEntry();

      if (this.onChange) this.onChange();
      if (this.hasRebuildError) {
        // 从出错中恢复时，刷新浏览器
        devServer.sockWrite(devServer.sockets, 'content-changed');
        this.hasRebuildError = false;
      }
    } catch (e) {
      // 向浏览器发送出错信息
      devServer.sockWrite(devServer.sockets, 'errors', [e.message]);

      this.hasRebuildError = true;
      this.routesContent = null; // why?
      debug(`Generate failed: ${e.message}`);
      debug(e);
      console.error(chalk.red(e.message));
    }
  }

  generateEntry() {
    const { paths, entryJSTpl, config, libraryName } = this.service;

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
      .replace(/<%= libraryName %>/g, libraryName)
      .replace(
        PLACEHOLDER_RENDER,
        `ReactDOM.render(React.createElement(require('./router').default), document.getElementById('root'));`,
      );

    if (!config.disableServiceWorker) {
      entryContent = `${entryContent}
// Enable service worker
if (process.env.NODE_ENV === 'production') {
  require('./registerServiceWorker');
}
      `;
    }
    writeFileSync(paths.absLibraryJSPath, entryContent, 'utf-8');
  }

  generateFiles() {
    const { paths, config } = this.service;
    this.service.applyPlugins('generateFiles');

    this.generateRouterJS();
    this.generateEntry();

    // Generate registerServiceWorker.js
    if (process.env.NODE_ENV === 'production' && !config.disableServiceWorker) {
      writeFileSync(
        paths.absRegisterSWJSPath,
        readFileSync(paths.defaultRegisterSWTplPath),
        'utf-8',
      );
    }
  }

  generateRouterJS() {
    const { paths, config } = this.service;
    const { absRouterJSPath } = paths;
    const routes = this.service.applyPlugins('modifyRoutes', {
      initialValue: getRouteConfig(paths, config),
    });

    this.service.setRoutes(routes);

    const routesContent = this.getRouterJSContent();
    // 避免文件写入导致不必要的 webpack 编译
    if (this.routesContent !== routesContent) {
      writeFileSync(absRouterJSPath, routesContent, 'utf-8');
      this.routesContent = routesContent;
    }
  }

  getRouterJSContent() {
    const { routerTpl, paths, libraryName } = this.service;
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
      requested: getRequest(),
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
      .replace(PLACEHOLDER_ROUTER, routerContent)
      .replace(/<%= libraryName %>/g, libraryName);
  }

  getRequestedRoutes(requested) {
    return Object.keys(requested).reduce((memo, pathname) => {
      matchRoutes(this.service.routes, pathname).forEach(({ route }) => {
        memo[route.path] = 1;
      });
      return memo;
    }, {});
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
    const { env, requested = {} } = opts;
    const requestedMap = this.getRequestedRoutes(requested);
    return routesToJSON(this.service.routes, this.service, requestedMap, env);
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
