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

  registerGenerator(name, opts) {
    const { generators } = this.service;
    assert(typeof name === 'string', `name should be supplied with a string, but got ${name}`);
    assert(opts && opts.Generator, `opts.Generator should be supplied`);
    assert(!(name in generators), `Generator ${name} exists, please select another one.`);
    generators[name] = opts;
  }

  generateFiles() {
    this.service.applyPlugins('onGenerateFiles');
    this.generateRouterJS();
    this.generateEntry();
    this.generateHistory();
  }

  generateEntry() {
    const { paths } = this.service;

    // Generate umi.js
    const entryTpl = readFileSync(paths.defaultEntryTplPath, 'utf-8');
    const initialRender = this.service.applyPlugins('modifyEntryRender', {
      initialValue: `
  const rootContainer = plugins.apply('rootContainer', {
    initialValue: React.createElement(require('./router').default),
  });
  ReactDOM.render(
    rootContainer,
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
      initialValue: ['patchRoutes', 'render', 'rootContainer', 'modifyRouteProps', 'onRouteChange'],
    });
    assert(
      uniq(validKeys).length === validKeys.length,
      `Conflict keys found in [${validKeys.join(', ')}]`,
    );
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
    });
    writeFileSync(paths.absLibraryJSPath, `${entryContent.trim()}\n`, 'utf-8');
  }

  registerMethod(name, opts) {
    assert(!this[name], `api.${name} exists.`);
    assert(opts, `opts must supplied`);
    const { type, apply } = opts;
    assert(!(type && apply), `Only be one for type and apply.`);
    assert(type || apply, `One of type and apply must supplied.`);

    this.service.pluginMethods[name] = (...args) => {
      if (apply) {
        this.register(name, opts => {
          return apply(opts, ...args);
        });
      } else if (type === this.API_TYPE.ADD) {
        this.register(name, opts => {
          return (opts.memo || []).concat(
            typeof args[0] === 'function' ? args[0](opts.memo, opts.args) : args[0],
          );
        });
      } else if (type === this.API_TYPE.MODIFY) {
        this.register(name, opts => {
          return typeof args[0] === 'function' ? args[0](opts.memo, opts.args) : args[0];
        });
      } else if (type === this.API_TYPE.EVENT) {
        this.register(name, opts => {
          return args[0](opts.args);
        });
      } else {
        throw new Error(`unexpected api type ${type}`);
      }
    };
  }

  addBabelRegister(files) {
    assert(Array.isArray(files), `files for registerBabel must be Array, but got ${files}`);
    addBabelRegisterFiles(files, {
      cwd: this.service.cwd,
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
