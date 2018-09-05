import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import mkdirp from 'mkdirp';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import Mustache from 'mustache';
import stripJSONQuote from './routes/stripJSONQuote';
import routesToJSON from './routes/routesToJSON';
import importsToStr from './importsToStr';
import { EXT_LIST } from './constants';

const debug = require('debug')('umi:FilesGenerator');

export default class FilesGenerator {
  constructor(opts) {
    Object.keys(opts).forEach(key => {
      this[key] = opts[key];
    });

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
    let pageWatchers = [
      paths.absPagesPath,
      ...EXT_LIST.map(ext => join(paths.absSrcPath, `${layout}/index${ext}`)),
    ];
    if (this.modifyPageWatcher) {
      pageWatchers = this.modifyPageWatcher(pageWatchers);
    }

    this.watchers = pageWatchers.map(p => {
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
    const { refreshBrowser, printError } = this.service;
    try {
      this.service.applyPlugins('onGenerateFiles', {
        args: {
          isRebuild: true,
        },
      });

      this.generateRouterJS();
      this.generateEntry();

      if (this.hasRebuildError) {
        refreshBrowser();
        this.hasRebuildError = false;
      }
    } catch (e) {
      // 向浏览器发送出错信息
      printError([e.message]);

      this.hasRebuildError = true;
      this.routesContent = null; // why?
      debug(`Generate failed: ${e.message}`);
      debug(e);
      console.error(chalk.red(e.message));
    }
  }

  generateFiles() {
    this.service.applyPlugins('onGenerateFiles');
    this.generateRouterJS();
    this.generateEntry();
  }

  generateEntry() {
    const { paths } = this.service;

    // Generate umi.js
    const entryTpl = readFileSync(paths.defaultEntryTplPath, 'utf-8');
    const initialRender = this.service.applyPlugins('modifyEntryRender', {
      initialValue: `
  ReactDOM.render(
    React.createElement(require('./router').default),
    document.getElementById('${this.mountElementId}'),
  );
      `.trim(),
    });

    const moduleBeforeRenderer = this.service
      .applyPlugins('addRendererWrapperWithModule', {
        initialValue: [],
      })
      .map((source, index) => {
        return {
          source,
          specifier: `moduleBeforeRenderer${index}`,
        };
      });

    const initialHistory = `
require('umi/_createHistory').default({
  basename: window.routerBase,
})
    `.trim();

    const entryContent = Mustache.render(entryTpl, {
      code: this.service
        .applyPlugins('addEntryCode', {
          initialValue: [],
        })
        .join('\n\n'),
      codeAhead: this.service
        .applyPlugins('addEntryCodeAhead', {
          initialValue: [],
        })
        .join('\n\n'),
      imports: importsToStr(
        this.service.applyPlugins('addEntryImport', {
          initialValue: moduleBeforeRenderer,
        }),
      ).join('\n'),
      importsAhead: importsToStr(
        this.service.applyPlugins('addEntryImportAhead', {
          initialValue: [],
        }),
      ).join('\n'),
      polyfillImports: importsToStr(
        this.service.applyPlugins('addEntryPolyfillImports', {
          initialValue: [],
        }),
      ).join('\n'),
      moduleBeforeRenderer,
      render: initialRender,
      history: this.service.applyPlugins('modifyEntryHistory', {
        initialValue: initialHistory,
      }),
    });
    writeFileSync(paths.absLibraryJSPath, `${entryContent.trim()}\n`, 'utf-8');
  }

  generateRouterJS() {
    const { paths } = this.service;
    const { absRouterJSPath } = paths;
    this.RoutesManager.fetchRoutes();

    const routesContent = this.getRouterJSContent();
    // 避免文件写入导致不必要的 webpack 编译
    if (this.routesContent !== routesContent) {
      writeFileSync(absRouterJSPath, `${routesContent.trim()}\n`, 'utf-8');
      this.routesContent = routesContent;
    }
  }

  getRouterJSContent() {
    const { paths } = this.service;
    const routerTpl = readFileSync(paths.defaultRouterTplPath, 'utf-8');
    const routes = stripJSONQuote(
      this.getRoutesJSON({
        env: process.env.NODE_ENV,
      }),
    );
    const rendererWrappers = this.service
      .applyPlugins('addRendererWrapperWithComponent', {
        initialValue: [],
      })
      .map((source, index) => {
        return {
          source,
          specifier: `RendererWrapper${index}`,
        };
      });

    const routerContent = this.getRouterContent(rendererWrappers);
    return Mustache.render(routerTpl, {
      imports: importsToStr(
        this.service.applyPlugins('addRouterImport', {
          initialValue: rendererWrappers,
        }),
      ).join('\n'),
      importsAhead: importsToStr(
        this.service.applyPlugins('addRouterImportAhead', {
          initialValue: [],
        }),
      ).join('\n'),
      routes,
      routerContent,
      RouterRootComponent: this.service.applyPlugins(
        'modifyRouterRootComponent',
        {
          initialValue: 'DefaultRouter',
        },
      ),
    });
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

  getRouterContent(rendererWrappers) {
    const defaultRenderer = `
    <Router history={window.g_history}>
      { renderRoutes(routes, {}) }
    </Router>
    `.trim();
    return rendererWrappers.reduce((memo, wrapper) => {
      return `
        <${wrapper.specifier}>
          ${memo}
        </${wrapper.specifier}>
      `.trim();
    }, defaultRenderer);
  }
}
