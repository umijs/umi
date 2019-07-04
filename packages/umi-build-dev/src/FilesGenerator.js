import { join, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import mkdirp from 'mkdirp';
import chokidar from 'chokidar';
import assert from 'assert';
import chalk from 'chalk';
import { debounce, uniq } from 'lodash';
import Mustache from 'mustache';
import { winPath, findJS } from 'umi-utils';
import stripJSONQuote from './routes/stripJSONQuote';
import routesToJSON from './routes/routesToJSON';
import importsToStr from './importsToStr';
import { EXT_LIST } from './constants';
import getHtmlGenerator from './plugins/commands/getHtmlGenerator';
import htmlToJSX from './htmlToJSX';
import getRoutePaths from './routes/getRoutePaths';

const debug = require('debug')('umi:FilesGenerator');

export const watcherIgnoreRegExp = /(^|[\/\\])(_mock.js$|\..)/;

export default class FilesGenerator {
  constructor(opts) {
    Object.keys(opts).forEach(key => {
      this[key] = opts[key];
    });

    this.routesContent = null;
    this.hasRebuildError = false;
  }

  generate() {
    debug('generate');
    const { paths } = this.service;
    const { absTmpDirPath, tmpDirPath } = paths;
    debug(`mkdir tmp dir: ${tmpDirPath}`);
    mkdirp.sync(absTmpDirPath);

    this.generateFiles();
  }

  createWatcher(path) {
    const watcher = chokidar.watch(path, {
      ignored: watcherIgnoreRegExp, // ignore .dotfiles and _mock.js
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
      ...EXT_LIST.map(ext => join(paths.absSrcPath, `app${ext}`)),
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
      this.generateHistory();

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
    this.generateHistory();
  }

  generateEntry() {
    const { paths, config } = this.service;

    // Generate umi.js
    const entryTpl = readFileSync(paths.defaultEntryTplPath, 'utf-8');
    const initialRender = this.service.applyPlugins('modifyEntryRender', {
      initialValue: `
  window.g_isBrowser = true;
  let props = {};
  // Both support SSR and CSR
  if (window.g_useSSR) {
    // 如果开启服务端渲染则客户端组件初始化 props 使用服务端注入的数据
    props = window.g_initialData;
  } else {
    const pathname = location.pathname;
    const activeRoute = findRoute(require('@tmp/router').routes, pathname);
    // 在客户端渲染前，执行 getInitialProps 方法
    // 拿到初始数据
    if (activeRoute && activeRoute.component && activeRoute.component.getInitialProps) {
      const initialProps = plugins.apply('modifyInitialProps', {
        initialValue: {},
      });
      props = activeRoute.component.getInitialProps ? await activeRoute.component.getInitialProps({
        route: activeRoute,
        isServer: false,
        ...initialProps,
      }) : {};
    }
  }
  const rootContainer = plugins.apply('rootContainer', {
    initialValue: React.createElement(require('./router').default, props),
  });
  ReactDOM[window.g_useSSR ? 'hydrate' : 'render'](
    rootContainer,
    document.getElementById('${config.mountElementId}'),
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

    const plugins = this.service
      .applyPlugins('addRuntimePlugin', {
        initialValue: [],
      })
      .map(plugin => {
        return winPath(relative(paths.absTmpDirPath, plugin));
      });
    if (findJS(paths.absSrcPath, 'app')) {
      plugins.push('@/app');
    }
    const validKeys = this.service.applyPlugins('addRuntimePluginKey', {
      initialValue: [
        'patchRoutes',
        'render',
        'rootContainer',
        'modifyRouteProps',
        'onRouteChange',
        'modifyInitialProps',
        'initialProps',
      ],
    });
    assert(
      uniq(validKeys).length === validKeys.length,
      `Conflict keys found in [${validKeys.join(', ')}]`,
    );

    let htmlTemplateMap = [];
    if (config.ssr) {
      assert(config.manifest, `manifest must be config when using ssr`);
      const isProd = process.env.NODE_ENV === 'production';
      const routePaths = getRoutePaths(this.RoutesManager.routes);
      htmlTemplateMap = routePaths.map(routePath => {
        let ssrHtml = '<></>';
        const hg = getHtmlGenerator(this.service, {
          chunksMap: {
            // TODO, for manifest
            // placeholder waiting manifest
            umi: [
              isProd ? '__UMI_SERVER__.js' : 'umi.js',
              isProd ? '__UMI_SERVER__.css' : 'umi.css',
            ],
          },
          headScripts: [
            {
              content: `
window.g_useSSR=true;
window.g_initialData = \${require('${winPath(require.resolve('serialize-javascript'))}')(props)};
              `.trim(),
            },
          ],
        });
        const content = hg.getMatchedContent(routePath);
        ssrHtml = htmlToJSX(content).replace(
          `<div id="${config.mountElementId || 'root'}"></div>`,
          `<div id="${config.mountElementId || 'root'}">{ rootContainer }</div>`,
        );
        return `'${routePath}': (${ssrHtml}),`;
      });
    }

    const entryContent = Mustache.render(entryTpl, {
      globalVariables: !this.service.config.disableGlobalVariables,
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
      plugins,
      validKeys,
      htmlTemplateMap: htmlTemplateMap.join('\n'),
      findRoutePath: winPath(require.resolve('./findRoute')),
    });
    writeFileSync(paths.absLibraryJSPath, `${entryContent.trim()}\n`, 'utf-8');
  }

  generateHistory() {
    const { paths, config } = this.service;
    const tpl = readFileSync(paths.defaultHistoryTplPath, 'utf-8');
    const initialHistory = `
require('umi/lib/createHistory').default({
  basename: window.routerBase,
})
    `.trim();
    let history = this.service.applyPlugins('modifyEntryHistory', {
      initialValue: initialHistory,
    });
    if (config.ssr) {
      history = `
__IS_BROWSER ? ${initialHistory} : require('history').createMemoryHistory()
      `.trim();
    }
    const content = Mustache.render(tpl, {
      globalVariables: !this.service.config.disableGlobalVariables,
      history,
    });
    writeFileSync(join(paths.absTmpDirPath, 'history.js'), `${content.trim()}\n`, 'utf-8');
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
      globalVariables: !this.service.config.disableGlobalVariables,
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
      RouterRootComponent: this.service.applyPlugins('modifyRouterRootComponent', {
        initialValue: 'DefaultRouter',
      }),
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
    <Router history={history}>
      { renderRoutes(routes, props) }
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
