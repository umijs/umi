import debug from 'debug';
import assert from 'assert';
import { relative } from 'path';
import lodash, { isPlainObject } from 'lodash';
import Mustache from 'mustache';
import { winPath, compatDirname, findJS, findCSS } from 'umi-utils';
import signale from 'signale';
import BasicGenerator from './BasicGenerator';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';

export default class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;

    // utils
    this.debug = debug(`umi-plugin: ${id}`);
    this.log = signale;
    this.winPath = winPath;
    this._ = lodash;
    this.compatDirname = compatDirname;
    this.findJS = findJS;
    this.findCSS = findCSS;
    this.Mustache = Mustache;
    this.Generator = BasicGenerator;

    this.API_TYPE = {
      ADD: Symbol('add'),
      MODIFY: Symbol('modify'),
      EVENT: Symbol('event'),
    };

    this._addMethods();

    // bind this
    this.relativeToTmp = this.relativeToTmp.bind(this);
  }

  relativeToTmp(path) {
    return this.winPath(relative(this.service.paths.absTmpDirPath, path));
  }

  _resolveDeps(file) {
    return require.resolve(file);
  }

  _addMethods() {
    [
      [
        'chainWebpackConfig',
        {
          type: this.API_TYPE.EVENT,
        },
      ],
      [
        '_registerConfig',
        {
          type: this.API_TYPE.ADD,
        },
      ],
      'onStart',
      'onExit',
      'onStartAsync',
      'onRouteChange',
      'onDevCompileDone',
      'onBuildSuccess',
      'onBuildSuccessAsync',
      'onBuildFail',
      'onPrintUmiError',
      'addPageWatcher',
      'addEntryCode',
      'addEntryCodeAhead',
      'addEntryImport',
      'addEntryImportAhead',
      'addEntryPolyfillImports',
      'addRendererWrapperWithComponent',
      'addRendererWrapperWithModule',
      'addRouterImport',
      'addRouterImportAhead',
      'addVersionInfo',
      'addUIPlugin',
      'onUISocket',
      'modifyAFWebpackOpts',
      'modifyEntryRender',
      'modifyEntryHistory',
      'modifyRouteComponent',
      'modifyRouterRootComponent',
      'modifyWebpackConfig',
      '_beforeServerWithApp',
      'beforeDevServer',
      '_beforeDevServerAsync',
      'afterDevServer',
      'addMiddlewareAhead',
      'addMiddleware',
      'addMiddlewareBeforeMock',
      'addMiddlewareAfterMock',
      'modifyRoutes',
      'onPatchRoute',
      'modifyHTMLContext',
      'modifyPublicPathStr',
      'addHTMLMeta',
      'addHTMLLink',
      'addHTMLScript',
      'addHTMLStyle',
      'addHTMLHeadScript',
      'addUmiExports',
      'modifyHTMLChunks',
      'onGenerateFiles',
      'onHTMLRebuild',
      'modifyDefaultConfig',
      '_modifyConfig',
      'modifyHTMLWithAST',
      '_modifyHelpInfo',
      'addRuntimePlugin',
      'addRuntimePluginKey',
      'beforeBlockWriting',
      'addBlockUIResource',
      'modifyBlockUIResources',
      '_modifyBlockPackageJSONPath',
      '_modifyBlockDependencies',
      '_modifyBlockFile',
      '_modifyBlockTarget',
      '_modifyCommand',
      '_modifyBlockNewRouteConfig',
      'beforeBuildCompileAsync',
    ].forEach(method => {
      if (Array.isArray(method)) {
        this.registerMethod(...method);
      } else {
        let type;
        const isPrivate = method.charAt(0) === '_';
        const slicedMethod = isPrivate ? method.slice(1) : method;
        if (slicedMethod.indexOf('modify') === 0) {
          type = this.API_TYPE.MODIFY;
        } else if (slicedMethod.indexOf('add') === 0) {
          type = this.API_TYPE.ADD;
        } else if (
          slicedMethod.indexOf('on') === 0 ||
          slicedMethod.indexOf('before') === 0 ||
          slicedMethod.indexOf('after') === 0
        ) {
          type = this.API_TYPE.EVENT;
        } else {
          throw new Error(`unexpected method name ${method}`);
        }
        this.registerMethod(method, { type });
      }
    });
  }

  register(hook, fn) {
    assert(
      typeof hook === 'string',
      `The first argument of api.register() must be string, but got ${hook}`,
    );
    assert(
      typeof fn === 'function',
      `The second argument of api.register() must be function, but got ${fn}`,
    );
    const { pluginHooks } = this.service;
    pluginHooks[hook] = pluginHooks[hook] || [];
    pluginHooks[hook].push({
      fn,
    });
  }

  registerCommand(name, opts, fn) {
    this.service.registerCommand(name, opts, fn);
  }

  registerGenerator(name, opts) {
    const { generators } = this.service;
    assert(typeof name === 'string', `name should be supplied with a string, but got ${name}`);
    assert(opts && opts.Generator, `opts.Generator should be supplied`);
    assert(!(name in generators), `Generator ${name} exists, please select another one.`);
    generators[name] = opts;
  }

  registerPlugin(opts) {
    assert(isPlainObject(opts), `opts should be plain object, but got ${opts}`);
    const { id, apply } = opts;
    assert(id && apply, `id and apply must supplied`);
    assert(typeof id === 'string', `id must be string`);
    assert(typeof apply === 'function', `apply must be function`);
    assert(
      id.indexOf('user:') !== 0 && id.indexOf('built-in:') !== 0,
      `api.registerPlugin() should not register plugin prefixed with user: and built-in:`,
    );
    assert(
      Object.keys(opts).every(key => ['id', 'apply', 'opts'].includes(key)),
      `Only id, apply and opts is valid plugin properties`,
    );
    this.service.extraPlugins.push(opts);
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
    registerBabel({
      cwd: this.service.cwd,
    });
  }
}
