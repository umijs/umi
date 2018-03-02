import assert from 'assert';
import { join, relative } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import getRouteConfig from './getRouteConfig';
import { getRequest } from './requestCache';
import winPath from './winPath';
import normalizeEntry from './normalizeEntry';
import {
  PLACEHOLDER_HISTORY_MODIFIER,
  PLACEHOLDER_IMPORT,
  PLACEHOLDER_RENDER,
  PLACEHOLDER_ROUTER,
  PLACEHOLDER_ROUTER_MODIFIER,
} from './constants';

const debug = require('debug')('umi:FilesGenerator');

export default class FilesGenerator {
  constructor(service) {
    this.service = service;
    this.routesContent = null;
    this.hasRebuildError = false;
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
    const { paths } = this.service;
    const watcherPaths = this.service.applyPlugins('modifyPageWatchers', {
      initialValue: [paths.absPagesPath],
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

      // rebuild 时只生成 router.js
      this.generateRouterJS();
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

  generateFiles() {
    const { paths, entryJSTpl, config, libraryName } = this.service;
    this.service.applyPlugins('generateFiles');

    this.generateRouterJS();

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

    // Generate registerServiceWorker.js
    writeFileSync(
      paths.absRegisterSWJSPath,
      readFileSync(paths.defaultRegisterSWTplPath),
      'utf-8',
    );
  }

  generateRouterJS() {
    const { paths, config } = this.service;
    const { absRouterJSPath } = paths;
    const routes = getRouteConfig(paths, config);

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

    const routerContent = this.service.applyPlugins('modifyRouterContent', {
      initialValue: this.getRouterContent(),
    });
    return tplContent
      .replace(PLACEHOLDER_IMPORT, '')
      .replace(PLACEHOLDER_ROUTER_MODIFIER, '')
      .replace(PLACEHOLDER_ROUTER, routerContent)
      .replace(/<%= libraryName %>/g, libraryName);
  }

  getRouterContent() {
    const { routes, config, paths } = this.service;

    const routesByPath = routes.reduce((memo, { path, component }) => {
      memo[path] = component;
      return memo;
    }, {});

    // 导出静态文件时，匹配 /index.html 到 /
    if (config.exportStatic && routesByPath['/']) {
      routesByPath['/index.html'] = routesByPath['/'];
    }

    const { loading } = config;
    let loadingOpts = '';
    if (loading) {
      loadingOpts = `loading: require('${winPath(
        join(paths.cwd, loading),
      )}').default,`;
    }
    let routesContent = Object.keys(routesByPath).map(key => {
      const pageJSFile = winPath(relative(paths.tmpDirPath, routesByPath[key]));
      debug(`requested: ${JSON.stringify(getRequest())}`);
      const isDev = process.env.NODE_ENV === 'development';

      let component;
      let isCompiling = false;
      let webpackChunkName = null;
      const compilingPath = winPath(join(__dirname, 'Compiling.js'));
      if (isDev && process.env.COMPILE_ON_DEMAND !== 'none') {
        if (getRequest()[key]) {
          component = `require('${pageJSFile}').default`;
        } else {
          component = `() => React.createElement(require('${compilingPath}').default, { route: '${key}' })`;
          isCompiling = true;
        }
      } else {
        webpackChunkName = normalizeEntry(routesByPath[key]);
        component = `dynamic(() => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'), { ${loadingOpts} })`;
      }
      component = this.service.applyPlugins('modifyRouteComponent', {
        initialValue: component,
        args: {
          isCompiling,
          pageJSFile,
          webpackChunkName,
          config,
        },
      });

      return `    <Route exact path="${key}" component={${component}} />`;
    });

    routesContent = this.service.applyPlugins('modifyRoutesContent', {
      initialValue: routesContent,
    });

    return `
<Router history={window.g_history}>
  <Switch>
${routesContent.join('\n')}
  </Switch>
</Router>
    `.trim();
  }
}
