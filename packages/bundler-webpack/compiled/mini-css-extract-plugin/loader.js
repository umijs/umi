"use strict";

const path = require("path");
const {
  findModuleById,
  evalModuleCode,
  AUTO_PUBLIC_PATH,
  ABSOLUTE_PUBLIC_PATH,
  BASE_URI,
  SINGLE_DOT_PATH_SEGMENT,
  stringifyRequest,
  stringifyLocal
} = require("./utils");
const schema = require("./loader-options.json");
const MiniCssExtractPlugin = require("./index");

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Chunk} Chunk */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").sources.Source} Source */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {import("webpack").NormalModule} NormalModule */
/** @typedef {import("./index.js").LoaderOptions} LoaderOptions */
/** @typedef {{ [key: string]: string | function }} Locals */

/** @typedef {any} TODO */

/**
 * @typedef {Object} Dependency
 * @property {string} identifier
 * @property {string | null} context
 * @property {Buffer} content
 * @property {string} media
 * @property {string} [supports]
 * @property {string} [layer]
 * @property {Buffer} [sourceMap]
 */

/**
 * @param {string} content
 * @param {{ loaderContext: import("webpack").LoaderContext<LoaderOptions>, options: LoaderOptions, locals: Locals | undefined }} context
 * @returns {string}
 */
function hotLoader(content, context) {
  const accept = context.locals ? "" : "module.hot.accept(undefined, cssReload);";
  return `${content}
    if(module.hot) {
      // ${Date.now()}
      var cssReload = require(${stringifyRequest(context.loaderContext, path.join(__dirname, "hmr/hotModuleReplacement.js"))})(module.id, ${JSON.stringify({
    ...context.options,
    locals: !!context.locals
  })});
      module.hot.dispose(cssReload);
      ${accept}
    }
  `;
}

/**
 * @this {import("webpack").LoaderContext<LoaderOptions>}
 * @param {string} request
 */
function pitch(request) {
  // @ts-ignore
  const options = this.getOptions( /** @type {Schema} */schema);
  const emit = typeof options.emit !== "undefined" ? options.emit : true;
  const callback = this.async();
  const optionsFromPlugin = /** @type {TODO} */this[MiniCssExtractPlugin.pluginSymbol];
  if (!optionsFromPlugin) {
    callback(new Error("You forgot to add 'mini-css-extract-plugin' plugin (i.e. `{ plugins: [new MiniCssExtractPlugin()] }`), please read https://github.com/webpack-contrib/mini-css-extract-plugin#getting-started"));
    return;
  }
  const {
    webpack
  } = /** @type {Compiler} */this._compiler;

  /**
   * @param {TODO} originalExports
   * @param {Compilation} [compilation]
   * @param {{ [name: string]: Source }} [assets]
   * @param {Map<string, AssetInfo>} [assetsInfo]
   * @returns {void}
   */
  const handleExports = (originalExports, compilation, assets, assetsInfo) => {
    /** @type {Locals | undefined} */
    let locals;
    let namedExport;
    const esModule = typeof options.esModule !== "undefined" ? options.esModule : true;

    /**
     * @param {Dependency[] | [null, object][]} dependencies
     */
    const addDependencies = dependencies => {
      if (!Array.isArray(dependencies) && dependencies != null) {
        throw new Error(`Exported value was not extracted as an array: ${JSON.stringify(dependencies)}`);
      }
      const identifierCountMap = new Map();
      let lastDep;
      for (const dependency of dependencies) {
        if (! /** @type {Dependency} */dependency.identifier || !emit) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const count = identifierCountMap.get( /** @type {Dependency} */dependency.identifier) || 0;
        const CssDependency = MiniCssExtractPlugin.getCssDependency(webpack);

        /** @type {NormalModule} */
        this._module.addDependency(lastDep = new CssDependency( /** @type {Dependency} */
        dependency, /** @type {Dependency} */
        dependency.context, count));
        identifierCountMap.set( /** @type {Dependency} */
        dependency.identifier, count + 1);
      }
      if (lastDep && assets) {
        lastDep.assets = assets;
        lastDep.assetsInfo = assetsInfo;
      }
    };
    try {
      // eslint-disable-next-line no-underscore-dangle
      const exports = originalExports.__esModule ? originalExports.default : originalExports;
      namedExport =
      // eslint-disable-next-line no-underscore-dangle
      originalExports.__esModule && (!originalExports.default || !("locals" in originalExports.default));
      if (namedExport) {
        Object.keys(originalExports).forEach(key => {
          if (key !== "default") {
            if (!locals) {
              locals = {};
            }

            /** @type {Locals} */
            locals[key] = originalExports[key];
          }
        });
      } else {
        locals = exports && exports.locals;
      }

      /** @type {Dependency[] | [null, object][]} */
      let dependencies;
      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]];
      } else {
        dependencies = exports.map(([id, content, media, sourceMap, supports, layer]) => {
          let identifier = id;
          let context;
          if (compilation) {
            const module = /** @type {Module} */
            findModuleById(compilation, id);
            identifier = module.identifier();
            ({
              context
            } = module);
          } else {
            // TODO check if this context is used somewhere
            context = this.rootContext;
          }
          return {
            identifier,
            context,
            content: Buffer.from(content),
            media,
            supports,
            layer,
            sourceMap: sourceMap ? Buffer.from(JSON.stringify(sourceMap)) :
            // eslint-disable-next-line no-undefined
            undefined
          };
        });
      }
      addDependencies(dependencies);
    } catch (e) {
      callback( /** @type {Error} */e);
      return;
    }
    const result = locals ? namedExport ? Object.keys(locals).map(key => `\nexport var ${key} = ${stringifyLocal( /** @type {Locals} */locals[key])};`).join("") : `\n${esModule ? "export default" : "module.exports ="} ${JSON.stringify(locals)};` : esModule ? `\nexport {};` : "";
    let resultSource = `// extracted by ${MiniCssExtractPlugin.pluginName}`;

    // only attempt hotreloading if the css is actually used for something other than hash values
    resultSource += this.hot && emit ? hotLoader(result, {
      loaderContext: this,
      options,
      locals
    }) : result;
    callback(null, resultSource);
  };
  let {
    publicPath
  } = /** @type {Compilation} */
  this._compilation.outputOptions;
  if (typeof options.publicPath === "string") {
    // eslint-disable-next-line prefer-destructuring
    publicPath = options.publicPath;
  } else if (typeof options.publicPath === "function") {
    publicPath = options.publicPath(this.resourcePath, this.rootContext);
  }
  if (publicPath === "auto") {
    publicPath = AUTO_PUBLIC_PATH;
  }
  if (typeof optionsFromPlugin.experimentalUseImportModule === "undefined" && typeof this.importModule === "function" || optionsFromPlugin.experimentalUseImportModule) {
    if (!this.importModule) {
      callback(new Error("You are using 'experimentalUseImportModule' but 'this.importModule' is not available in loader context. You need to have at least webpack 5.33.2."));
      return;
    }
    let publicPathForExtract;
    if (typeof publicPath === "string") {
      const isAbsolutePublicPath = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(publicPath);
      publicPathForExtract = isAbsolutePublicPath ? publicPath : `${ABSOLUTE_PUBLIC_PATH}${publicPath.replace(/\./g, SINGLE_DOT_PATH_SEGMENT)}`;
    } else {
      publicPathForExtract = publicPath;
    }
    this.importModule(`${this.resourcePath}.webpack[javascript/auto]!=!!!${request}`, {
      layer: options.layer,
      publicPath: /** @type {string} */publicPathForExtract,
      baseUri: `${BASE_URI}/`
    },
    /**
     * @param {Error | null | undefined} error
     * @param {object} exports
     */
    (error, exports) => {
      if (error) {
        callback(error);
        return;
      }
      handleExports(exports);
    });
    return;
  }
  const loaders = this.loaders.slice(this.loaderIndex + 1);
  this.addDependency(this.resourcePath);
  const childFilename = "*";
  const outputOptions = {
    filename: childFilename,
    publicPath
  };
  const childCompiler = /** @type {Compilation} */
  this._compilation.createChildCompiler(`${MiniCssExtractPlugin.pluginName} ${request}`, outputOptions);

  // The templates are compiled and executed by NodeJS - similar to server side rendering
  // Unfortunately this causes issues as some loaders require an absolute URL to support ES Modules
  // The following config enables relative URL support for the child compiler
  childCompiler.options.module = {
    ...childCompiler.options.module
  };
  childCompiler.options.module.parser = {
    ...childCompiler.options.module.parser
  };
  childCompiler.options.module.parser.javascript = {
    ...childCompiler.options.module.parser.javascript,
    url: "relative"
  };
  const {
    NodeTemplatePlugin
  } = webpack.node;
  const {
    NodeTargetPlugin
  } = webpack.node;
  new NodeTemplatePlugin(outputOptions).apply(childCompiler);
  new NodeTargetPlugin().apply(childCompiler);
  const {
    EntryOptionPlugin
  } = webpack;
  const {
    library: {
      EnableLibraryPlugin
    }
  } = webpack;
  new EnableLibraryPlugin("commonjs2").apply(childCompiler);
  EntryOptionPlugin.applyEntryOption(childCompiler, this.context, {
    child: {
      library: {
        type: "commonjs2"
      },
      import: [`!!${request}`]
    }
  });
  const {
    LimitChunkCountPlugin
  } = webpack.optimize;
  new LimitChunkCountPlugin({
    maxChunks: 1
  }).apply(childCompiler);
  const {
    NormalModule
  } = webpack;
  childCompiler.hooks.thisCompilation.tap(`${MiniCssExtractPlugin.pluginName} loader`,
  /**
   * @param {Compilation} compilation
   */
  compilation => {
    const normalModuleHook = NormalModule.getCompilationHooks(compilation).loader;
    normalModuleHook.tap(`${MiniCssExtractPlugin.pluginName} loader`, (loaderContext, module) => {
      if (module.request === request) {
        // eslint-disable-next-line no-param-reassign
        module.loaders = loaders.map(loader => {
          return {
            type: null,
            loader: loader.path,
            options: loader.options,
            ident: loader.ident
          };
        });
      }
    });
  });

  /** @type {string | Buffer} */
  let source;
  childCompiler.hooks.compilation.tap(MiniCssExtractPlugin.pluginName,
  /**
   * @param {Compilation} compilation
   */
  compilation => {
    compilation.hooks.processAssets.tap(MiniCssExtractPlugin.pluginName, () => {
      source = compilation.assets[childFilename] && compilation.assets[childFilename].source();

      // Remove all chunk assets
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          compilation.deleteAsset(file);
        });
      });
    });
  });
  childCompiler.runAsChild((error, entries, compilation) => {
    if (error) {
      callback(error);
      return;
    }
    if ( /** @type {Compilation} */compilation.errors.length > 0) {
      callback( /** @type {Compilation} */compilation.errors[0]);
      return;
    }

    /** @type {{ [name: string]: Source }} */
    const assets = Object.create(null);
    /** @type {Map<string, AssetInfo>} */
    const assetsInfo = new Map();
    for (const asset of /** @type {Compilation} */compilation.getAssets()) {
      assets[asset.name] = asset.source;
      assetsInfo.set(asset.name, asset.info);
    }

    /** @type {Compilation} */
    compilation.fileDependencies.forEach(dep => {
      this.addDependency(dep);
    }, this);

    /** @type {Compilation} */
    compilation.contextDependencies.forEach(dep => {
      this.addContextDependency(dep);
    }, this);
    if (!source) {
      callback(new Error("Didn't get a result from child compiler"));
      return;
    }
    let originalExports;
    try {
      originalExports = evalModuleCode(this, source, request);
    } catch (e) {
      callback( /** @type {Error} */e);
      return;
    }
    handleExports(originalExports, compilation, assets, assetsInfo);
  });
}
module.exports = {
  default: function loader() {},
  pitch
};