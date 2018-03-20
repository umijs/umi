import assert from 'assert';
import { join, relative } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import { matchRoutes } from 'react-router-config';
import getRouteConfig from './getRouteConfig';
import { getRequest } from './requestCache';
import winPath from './winPath';
import normalizeEntry from './normalizeEntry';
import {
  EXT_LIST,
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
    const { paths } = this.service;
    this.service.applyPlugins('generateFiles');

    this.generateRouterJS();
    this.generateEntry();

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

    const routes = this.getRoutesJSON({
      env: process.env.NODE_ENV,
      requested: getRequest(),
    });

    const routerContent = this.service.applyPlugins('modifyRouterContent', {
      initialValue: this.getRouterContent(),
    });
    return tplContent
      .replace(PLACEHOLDER_IMPORT, '')
      .replace(PLACEHOLDER_ROUTER_MODIFIER, '')
      .replace('<%= ROUTES %>', routes)
      .replace(PLACEHOLDER_ROUTER, routerContent)
      .replace(/<%= libraryName %>/g, libraryName);
  }

  getLayoutFile() {
    const { paths } = this.service;
    for (const ext of EXT_LIST) {
      const filePath = join(paths.absSrcPath, `layouts/index${ext}`);
      if (existsSync(filePath)) {
        return winPath(filePath);
      }
    }
    return winPath(join(__dirname, './defaultLayout.js'));
  }

  markRouteWithSuffix(routes, webpackChunkName) {
    return routes.map(route => {
      const ret = {
        ...route,
        component: `${route.component}^^${webpackChunkName}^^${route.path}`,
      };
      if (ret.routes) {
        ret.routes = this.markRouteWithSuffix(route.routes, webpackChunkName);
      }
      return ret;
    });
  }

  getRequestedRoutes(requested) {
    const { routes } = this.service;
    return Object.keys(requested).reduce((memo, pathname) => {
      matchRoutes(routes, pathname).forEach(({ route }) => {
        memo[route.path] = 1;
      });
      return memo;
    }, {});
  }

  getRoutesJSON(opts = {}) {
    const { env = 'production', requested = {} } = opts;
    const { routes, paths, config = {} } = this.service;

    // 导出静态文件时，匹配 /index.html 到 /
    // TODO: test it
    // if (config.exportStatic && routesByPath['/']) {
    //   routesByPath['/index.html'] = routesByPath['/'];
    // }

    const { loading } = config;
    let loadingOpts = '';
    if (loading) {
      loadingOpts = `loading: require('${winPath(
        join(paths.cwd, loading),
      )}').default,`;
    }

    // 只在一级路由做按需编译
    routes.forEach(route => {
      const webpackChunkName = normalizeEntry(route.component);
      route.component = `${route.component}^^${webpackChunkName}^^${
        route.path
      }`;
      if (route.routes) {
        route.routes = this.markRouteWithSuffix(route.routes, webpackChunkName);
      }
    });

    // 添加 layout wrapper
    const layoutFile = this.getLayoutFile();
    const wrappedRoutes = [
      {
        component: layoutFile,
        routes,
      },
    ];

    const requestedPaths = this.getRequestedRoutes(requested);
    const compilingPath = winPath(join(__dirname, 'Compiling.js'));

    let ret = JSON.stringify(
      wrappedRoutes,
      (key, value) => {
        if (key === 'component') {
          const [component, webpackChunkName, path] = value.split('^^');
          const importPath =
            value.charAt(0) === '/'
              ? value
              : winPath(relative(paths.tmpDirPath, component));

          let ret;
          let isCompiling = false;
          if (value === layoutFile) {
            ret = `require('${importPath}').default`;
          } else if (env === 'production') {
            // 按需加载
            ret = `dynamic(() => import(/* webpackChunkName: ${webpackChunkName} */'${importPath}'), {${loadingOpts}})`;
          } else {
            // 非按需加载
            if (
              process.env.COMPILE_ON_DEMAND === 'none' ||
              requestedPaths[path]
            ) {
              ret = `require('${importPath}').default`;
            } else {
              isCompiling = true;
              ret = `() => React.createElement(require('${compilingPath}').default, { route: '${path}' })`;
            }
          }

          ret = this.service.applyPlugins('modifyRouteComponent', {
            initialValue: ret,
            args: {
              isCompiling,
              pageJSFile: importPath,
              importPath,
              webpackChunkName,
              config,
            },
          });

          ret = `^^${ret}^^`;

          return ret;
        } else {
          return value;
        }
      },
      2,
    );
    ret = ret.replace(/\"\^\^/g, '').replace(/\^\^\"/g, '');
    return ret;
  }

  getRouterContent() {
    return `
<Router history={window.g_history}>
  { renderRoutes(routes) }
</Router>
    `.trim();
  }
}
