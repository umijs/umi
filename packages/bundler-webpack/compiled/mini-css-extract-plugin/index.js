/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 985:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.trueFn = trueFn;
exports.findModuleById = findModuleById;
exports.evalModuleCode = evalModuleCode;
exports.compareModulesByIdentifier = compareModulesByIdentifier;
exports.stringifyRequest = stringifyRequest;
exports.DOUBLE_DOT_PATH_SEGMENT = exports.SINGLE_DOT_PATH_SEGMENT = exports.ABSOLUTE_PUBLIC_PATH = exports.AUTO_PUBLIC_PATH = exports.MODULE_TYPE = void 0;

var _module = _interopRequireDefault(__nccwpck_require__(282));

var _path = _interopRequireDefault(__nccwpck_require__(622));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function trueFn() {
  return true;
}

function findModuleById(compilation, id) {
  const {
    modules,
    chunkGraph
  } = compilation;

  for (const module of modules) {
    const moduleId = typeof chunkGraph !== "undefined" ? chunkGraph.getModuleId(module) : module.id;

    if (moduleId === id) {
      return module;
    }
  }

  return null;
}

function evalModuleCode(loaderContext, code, filename) {
  const module = new _module.default(filename, loaderContext);
  module.paths = _module.default._nodeModulePaths(loaderContext.context); // eslint-disable-line no-underscore-dangle

  module.filename = filename;

  module._compile(code, filename); // eslint-disable-line no-underscore-dangle


  return module.exports;
}

function compareIds(a, b) {
  if (typeof a !== typeof b) {
    return typeof a < typeof b ? -1 : 1;
  }

  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

function compareModulesByIdentifier(a, b) {
  return compareIds(a.identifier(), b.identifier());
}

const MODULE_TYPE = "css/mini-extract";
exports.MODULE_TYPE = MODULE_TYPE;
const AUTO_PUBLIC_PATH = "__mini_css_extract_plugin_public_path_auto__";
exports.AUTO_PUBLIC_PATH = AUTO_PUBLIC_PATH;
const ABSOLUTE_PUBLIC_PATH = "webpack:///mini-css-extract-plugin/";
exports.ABSOLUTE_PUBLIC_PATH = ABSOLUTE_PUBLIC_PATH;
const SINGLE_DOT_PATH_SEGMENT = "__mini_css_extract_plugin_single_dot_path_segment__";
exports.SINGLE_DOT_PATH_SEGMENT = SINGLE_DOT_PATH_SEGMENT;
const DOUBLE_DOT_PATH_SEGMENT = "__mini_css_extract_plugin_double_dot_path_segment__";
exports.DOUBLE_DOT_PATH_SEGMENT = DOUBLE_DOT_PATH_SEGMENT;

function isAbsolutePath(str) {
  return _path.default.posix.isAbsolute(str) || _path.default.win32.isAbsolute(str);
}

const RELATIVE_PATH_REGEXP = /^\.\.?[/\\]/;

function isRelativePath(str) {
  return RELATIVE_PATH_REGEXP.test(str);
}

function stringifyRequest(loaderContext, request) {
  const splitted = request.split("!");
  const {
    context
  } = loaderContext;
  return JSON.stringify(splitted.map(part => {
    // First, separate singlePath from query, because the query might contain paths again
    const splittedPart = part.match(/^(.*?)(\?.*)/);
    const query = splittedPart ? splittedPart[2] : "";
    let singlePath = splittedPart ? splittedPart[1] : part;

    if (isAbsolutePath(singlePath) && context) {
      singlePath = _path.default.relative(context, singlePath);

      if (isAbsolutePath(singlePath)) {
        // If singlePath still matches an absolute path, singlePath was on a different drive than context.
        // In this case, we leave the path platform-specific without replacing any separators.
        // @see https://github.com/webpack/loader-utils/pull/14
        return singlePath + query;
      }

      if (isRelativePath(singlePath) === false) {
        // Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
        singlePath = `./${singlePath}`;
      }
    }

    return singlePath.replace(/\\/g, "/") + query;
  }).join("!"));
}

/***/ }),

/***/ 237:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/



const path = __nccwpck_require__(622);

const WINDOWS_ABS_PATH_REGEXP = /^[a-zA-Z]:[\\/]/;
const SEGMENTS_SPLIT_REGEXP = /([|!])/;
const WINDOWS_PATH_SEPARATOR_REGEXP = /\\/g;

/**
 * @typedef {Object} MakeRelativePathsCache
 * @property {Map<string, Map<string, string>>=} relativePaths
 */

const relativePathToRequest = relativePath => {
	if (relativePath === "") return "./.";
	if (relativePath === "..") return "../.";
	if (relativePath.startsWith("../")) return relativePath;
	return `./${relativePath}`;
};

/**
 * @param {string} context context for relative path
 * @param {string} maybeAbsolutePath path to make relative
 * @returns {string} relative path in request style
 */
const absoluteToRequest = (context, maybeAbsolutePath) => {
	if (maybeAbsolutePath[0] === "/") {
		if (
			maybeAbsolutePath.length > 1 &&
			maybeAbsolutePath[maybeAbsolutePath.length - 1] === "/"
		) {
			// this 'path' is actually a regexp generated by dynamic requires.
			// Don't treat it as an absolute path.
			return maybeAbsolutePath;
		}

		const querySplitPos = maybeAbsolutePath.indexOf("?");
		let resource =
			querySplitPos === -1
				? maybeAbsolutePath
				: maybeAbsolutePath.slice(0, querySplitPos);
		resource = relativePathToRequest(path.posix.relative(context, resource));
		return querySplitPos === -1
			? resource
			: resource + maybeAbsolutePath.slice(querySplitPos);
	}

	if (WINDOWS_ABS_PATH_REGEXP.test(maybeAbsolutePath)) {
		const querySplitPos = maybeAbsolutePath.indexOf("?");
		let resource =
			querySplitPos === -1
				? maybeAbsolutePath
				: maybeAbsolutePath.slice(0, querySplitPos);
		resource = path.win32.relative(context, resource);
		if (!WINDOWS_ABS_PATH_REGEXP.test(resource)) {
			resource = relativePathToRequest(
				resource.replace(WINDOWS_PATH_SEPARATOR_REGEXP, "/")
			);
		}
		return querySplitPos === -1
			? resource
			: resource + maybeAbsolutePath.slice(querySplitPos);
	}

	// not an absolute path
	return maybeAbsolutePath;
};

/**
 * @param {string} context context for relative path
 * @param {string} relativePath path
 * @returns {string} absolute path
 */
const requestToAbsolute = (context, relativePath) => {
	if (relativePath.startsWith("./") || relativePath.startsWith("../"))
		return path.join(context, relativePath);
	return relativePath;
};

const makeCacheable = fn => {
	/** @type {WeakMap<object, Map<string, Map<string, string>>>} */
	const cache = new WeakMap();

	/**
	 * @param {string} context context used to create relative path
	 * @param {string} identifier identifier used to create relative path
	 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
	 * @returns {string} the returned relative path
	 */
	const cachedFn = (context, identifier, associatedObjectForCache) => {
		if (!associatedObjectForCache) return fn(context, identifier);

		let innerCache = cache.get(associatedObjectForCache);
		if (innerCache === undefined) {
			innerCache = new Map();
			cache.set(associatedObjectForCache, innerCache);
		}

		let cachedResult;
		let innerSubCache = innerCache.get(context);
		if (innerSubCache === undefined) {
			innerCache.set(context, (innerSubCache = new Map()));
		} else {
			cachedResult = innerSubCache.get(identifier);
		}

		if (cachedResult !== undefined) {
			return cachedResult;
		} else {
			const result = fn(context, identifier);
			innerSubCache.set(identifier, result);
			return result;
		}
	};

	/**
	 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
	 * @returns {function(string, string): string} cached function
	 */
	cachedFn.bindCache = associatedObjectForCache => {
		let innerCache;
		if (associatedObjectForCache) {
			innerCache = cache.get(associatedObjectForCache);
			if (innerCache === undefined) {
				innerCache = new Map();
				cache.set(associatedObjectForCache, innerCache);
			}
		} else {
			innerCache = new Map();
		}

		/**
		 * @param {string} context context used to create relative path
		 * @param {string} identifier identifier used to create relative path
		 * @returns {string} the returned relative path
		 */
		const boundFn = (context, identifier) => {
			let cachedResult;
			let innerSubCache = innerCache.get(context);
			if (innerSubCache === undefined) {
				innerCache.set(context, (innerSubCache = new Map()));
			} else {
				cachedResult = innerSubCache.get(identifier);
			}

			if (cachedResult !== undefined) {
				return cachedResult;
			} else {
				const result = fn(context, identifier);
				innerSubCache.set(identifier, result);
				return result;
			}
		};

		return boundFn;
	};

	/**
	 * @param {string} context context used to create relative path
	 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
	 * @returns {function(string): string} cached function
	 */
	cachedFn.bindContextCache = (context, associatedObjectForCache) => {
		let innerSubCache;
		if (associatedObjectForCache) {
			let innerCache = cache.get(associatedObjectForCache);
			if (innerCache === undefined) {
				innerCache = new Map();
				cache.set(associatedObjectForCache, innerCache);
			}

			innerSubCache = innerCache.get(context);
			if (innerSubCache === undefined) {
				innerCache.set(context, (innerSubCache = new Map()));
			}
		} else {
			innerSubCache = new Map();
		}

		/**
		 * @param {string} identifier identifier used to create relative path
		 * @returns {string} the returned relative path
		 */
		const boundFn = identifier => {
			const cachedResult = innerSubCache.get(identifier);
			if (cachedResult !== undefined) {
				return cachedResult;
			} else {
				const result = fn(context, identifier);
				innerSubCache.set(identifier, result);
				return result;
			}
		};

		return boundFn;
	};

	return cachedFn;
};

/**
 *
 * @param {string} context context for relative path
 * @param {string} identifier identifier for path
 * @returns {string} a converted relative path
 */
const _makePathsRelative = (context, identifier) => {
	return identifier
		.split(SEGMENTS_SPLIT_REGEXP)
		.map(str => absoluteToRequest(context, str))
		.join("");
};

exports.makePathsRelative = makeCacheable(_makePathsRelative);

/**
 *
 * @param {string} context context for relative path
 * @param {string} identifier identifier for path
 * @returns {string} a converted relative path
 */
const _makePathsAbsolute = (context, identifier) => {
	return identifier
		.split(SEGMENTS_SPLIT_REGEXP)
		.map(str => requestToAbsolute(context, str))
		.join("");
};

exports.makePathsAbsolute = makeCacheable(_makePathsAbsolute);

/**
 * @param {string} context absolute context path
 * @param {string} request any request string may containing absolute paths, query string, etc.
 * @returns {string} a new request string avoiding absolute paths when possible
 */
const _contextify = (context, request) => {
	return request
		.split("!")
		.map(r => absoluteToRequest(context, r))
		.join("!");
};

const contextify = makeCacheable(_contextify);
exports.contextify = contextify;

/**
 * @param {string} context absolute context path
 * @param {string} request any request string
 * @returns {string} a new request string using absolute paths when possible
 */
const _absolutify = (context, request) => {
	return request
		.split("!")
		.map(r => requestToAbsolute(context, r))
		.join("!");
};

const absolutify = makeCacheable(_absolutify);
exports.absolutify = absolutify;

const PATH_QUERY_FRAGMENT_REGEXP =
	/^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

/** @typedef {{ resource: string, path: string, query: string, fragment: string }} ParsedResource */

/**
 * @param {string} str the path with query and fragment
 * @returns {ParsedResource} parsed parts
 */
const _parseResource = str => {
	const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
	return {
		resource: str,
		path: match[1].replace(/\0(.)/g, "$1"),
		query: match[2] ? match[2].replace(/\0(.)/g, "$1") : "",
		fragment: match[3] || ""
	};
};
exports.parseResource = (realFn => {
	/** @type {WeakMap<object, Map<string, ParsedResource>>} */
	const cache = new WeakMap();

	const getCache = associatedObjectForCache => {
		const entry = cache.get(associatedObjectForCache);
		if (entry !== undefined) return entry;
		/** @type {Map<string, ParsedResource>} */
		const map = new Map();
		cache.set(associatedObjectForCache, map);
		return map;
	};

	/**
	 * @param {string} str the path with query and fragment
	 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
	 * @returns {ParsedResource} parsed parts
	 */
	const fn = (str, associatedObjectForCache) => {
		if (!associatedObjectForCache) return realFn(str);
		const cache = getCache(associatedObjectForCache);
		const entry = cache.get(str);
		if (entry !== undefined) return entry;
		const result = realFn(str);
		cache.set(str, result);
		return result;
	};

	fn.bindCache = associatedObjectForCache => {
		const cache = getCache(associatedObjectForCache);
		return str => {
			const entry = cache.get(str);
			if (entry !== undefined) return entry;
			const result = realFn(str);
			cache.set(str, result);
			return result;
		};
	};

	return fn;
})(_parseResource);

/**
 * @param {string} filename the filename which should be undone
 * @param {string} outputPath the output path that is restored (only relevant when filename contains "..")
 * @param {boolean} enforceRelative true returns ./ for empty paths
 * @returns {string} repeated ../ to leave the directory of the provided filename to be back on output dir
 */
exports.getUndoPath = (filename, outputPath, enforceRelative) => {
	let depth = -1;
	let append = "";
	outputPath = outputPath.replace(/[\\/]$/, "");
	for (const part of filename.split(/[/\\]+/)) {
		if (part === "..") {
			if (depth > -1) {
				depth--;
			} else {
				const i = outputPath.lastIndexOf("/");
				const j = outputPath.lastIndexOf("\\");
				const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j);
				if (pos < 0) return outputPath + "/";
				append = outputPath.slice(pos + 1) + "/" + append;
				outputPath = outputPath.slice(0, pos);
			}
		} else if (part !== ".") {
			depth++;
		}
	}
	return depth > 0
		? `${"../".repeat(depth)}${append}`
		: enforceRelative
		? `./${append}`
		: append;
};


/***/ }),

/***/ 570:
/***/ (function(module) {

module.exports = JSON.parse('{"title":"Mini CSS Extract Plugin options","type":"object","additionalProperties":false,"properties":{"filename":{"anyOf":[{"type":"string"},{"instanceof":"Function"}],"description":"This option determines the name of each output CSS file.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#filename"},"chunkFilename":{"anyOf":[{"type":"string"},{"instanceof":"Function"}],"description":"This option determines the name of non-entry chunk files.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#chunkfilename"},"experimentalUseImportModule":{"type":"boolean","description":"Enable the experimental importModule approach instead of using child compilers. This uses less memory and is faster.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#experimentaluseimportmodule"},"ignoreOrder":{"type":"boolean","description":"Remove Order Warnings.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#ignoreorder"},"insert":{"description":"Inserts `<link>` at the given position.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#insert","anyOf":[{"type":"string"},{"instanceof":"Function"}]},"attributes":{"description":"Adds custom attributes to tag.","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#attributes","type":"object"},"linkType":{"anyOf":[{"enum":["text/css"]},{"type":"boolean"}],"description":"This option allows loading asynchronous chunks with a custom link type","link":"https://github.com/webpack-contrib/mini-css-extract-plugin#linktype"}}}');

/***/ }),

/***/ 561:
/***/ (function(module) {

module.exports = require("@umijs/bundler-webpack/compiled/schema-utils");

/***/ }),

/***/ 282:
/***/ (function(module) {

module.exports = require("module");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = exports.pluginSymbol = exports.pluginName = void 0;

var _schemaUtils = __nccwpck_require__(561);

var _identifier = __nccwpck_require__(237);

var _pluginOptions = _interopRequireDefault(__nccwpck_require__(570));

var _utils = __nccwpck_require__(985);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable class-methods-use-this */
const pluginName = "mini-css-extract-plugin";
exports.pluginName = pluginName;
const pluginSymbol = Symbol(pluginName);
exports.pluginSymbol = pluginSymbol;
const DEFAULT_FILENAME = "[name].css";
const TYPES = new Set([_utils.MODULE_TYPE]);
const CODE_GENERATION_RESULT = {
  sources: new Map(),
  runtimeRequirements: new Set()
};
/**
 * @type WeakMap<webpack, CssModule>
 */

const cssModuleCache = new WeakMap();
/**
 * @type WeakMap<webpack, CssDependency>
 */

const cssDependencyCache = new WeakMap();
const registered = new WeakSet();

class MiniCssExtractPlugin {
  static getCssModule(webpack) {
    /**
     * Prevent creation of multiple CssModule classes to allow other integrations to get the current CssModule.
     */
    if (cssModuleCache.has(webpack)) {
      return cssModuleCache.get(webpack);
    }

    class CssModule extends webpack.Module {
      constructor({
        context,
        identifier,
        identifierIndex,
        content,
        media,
        sourceMap,
        assets,
        assetsInfo
      }) {
        super(_utils.MODULE_TYPE, context);
        this.id = "";
        this._context = context;
        this._identifier = identifier;
        this._identifierIndex = identifierIndex;
        this.content = content;
        this.media = media;
        this.sourceMap = sourceMap;
        this.assets = assets;
        this.assetsInfo = assetsInfo;
        this._needBuild = true;
      } // no source() so webpack 4 doesn't do add stuff to the bundle


      size() {
        return this.content.length;
      }

      identifier() {
        return `css|${this._identifier}|${this._identifierIndex}`;
      }

      readableIdentifier(requestShortener) {
        return `css ${requestShortener.shorten(this._identifier)}${this._identifierIndex ? ` (${this._identifierIndex})` : ""}`;
      } // eslint-disable-next-line class-methods-use-this


      getSourceTypes() {
        return TYPES;
      } // eslint-disable-next-line class-methods-use-this


      codeGeneration() {
        return CODE_GENERATION_RESULT;
      }

      nameForCondition() {
        const resource = this._identifier.split("!").pop();

        const idx = resource.indexOf("?");

        if (idx >= 0) {
          return resource.substring(0, idx);
        }

        return resource;
      }

      updateCacheModule(module) {
        if (this.content !== module.content || this.media !== module.media || this.sourceMap !== module.sourceMap || this.assets !== module.assets || this.assetsInfo !== module.assetsInfo) {
          this._needBuild = true;
          this.content = module.content;
          this.media = module.media;
          this.sourceMap = module.sourceMap;
          this.assets = module.assets;
          this.assetsInfo = module.assetsInfo;
        }
      } // eslint-disable-next-line class-methods-use-this


      needRebuild() {
        return this._needBuild;
      } // eslint-disable-next-line class-methods-use-this


      needBuild(context, callback) {
        callback(null, this._needBuild);
      }

      build(options, compilation, resolver, fileSystem, callback) {
        this.buildInfo = {
          assets: this.assets,
          assetsInfo: this.assetsInfo,
          cacheable: true,
          hash: this._computeHash(compilation.outputOptions.hashFunction)
        };
        this.buildMeta = {};
        this._needBuild = false;
        callback();
      }

      _computeHash(hashFunction) {
        const hash = webpack.util.createHash(hashFunction);
        hash.update(this.content);
        hash.update(this.media || "");
        hash.update(this.sourceMap || "");
        return hash.digest("hex");
      }

      updateHash(hash, context) {
        super.updateHash(hash, context);
        hash.update(this.buildInfo.hash);
      }

      serialize(context) {
        const {
          write
        } = context;
        write(this._context);
        write(this._identifier);
        write(this._identifierIndex);
        write(this.content);
        write(this.media);
        write(this.sourceMap);
        write(this.assets);
        write(this.assetsInfo);
        write(this._needBuild);
        super.serialize(context);
      }

      deserialize(context) {
        this._needBuild = context.read();
        super.deserialize(context);
      }

    }

    cssModuleCache.set(webpack, CssModule);
    webpack.util.serialization.register(CssModule, "mini-css-extract-plugin/dist/CssModule", null, {
      serialize(instance, context) {
        instance.serialize(context);
      },

      deserialize(context) {
        const {
          read
        } = context;
        const contextModule = read();
        const identifier = read();
        const identifierIndex = read();
        const content = read();
        const media = read();
        const sourceMap = read();
        const assets = read();
        const assetsInfo = read();
        const dep = new CssModule({
          context: contextModule,
          identifier,
          identifierIndex,
          content,
          media,
          sourceMap,
          assets,
          assetsInfo
        });
        dep.deserialize(context);
        return dep;
      }

    });
    return CssModule;
  }

  static getCssDependency(webpack) {
    /**
     * Prevent creation of multiple CssDependency classes to allow other integrations to get the current CssDependency.
     */
    if (cssDependencyCache.has(webpack)) {
      return cssDependencyCache.get(webpack);
    } // eslint-disable-next-line no-shadow


    class CssDependency extends webpack.Dependency {
      constructor({
        identifier,
        content,
        media,
        sourceMap
      }, context, identifierIndex) {
        super();
        this.identifier = identifier;
        this.identifierIndex = identifierIndex;
        this.content = content;
        this.media = media;
        this.sourceMap = sourceMap;
        this.context = context; // eslint-disable-next-line no-undefined

        this.assets = undefined; // eslint-disable-next-line no-undefined

        this.assetsInfo = undefined;
      }

      getResourceIdentifier() {
        return `css-module-${this.identifier}-${this.identifierIndex}`;
      } // eslint-disable-next-line class-methods-use-this


      getModuleEvaluationSideEffectsState() {
        return webpack.ModuleGraphConnection.TRANSITIVE_ONLY;
      }

      serialize(context) {
        const {
          write
        } = context;
        write(this.identifier);
        write(this.content);
        write(this.media);
        write(this.sourceMap);
        write(this.context);
        write(this.identifierIndex);
        write(this.assets);
        write(this.assetsInfo);
        super.serialize(context);
      }

      deserialize(context) {
        super.deserialize(context);
      }

    }

    cssDependencyCache.set(webpack, CssDependency);
    webpack.util.serialization.register(CssDependency, "mini-css-extract-plugin/dist/CssDependency", null, {
      serialize(instance, context) {
        instance.serialize(context);
      },

      deserialize(context) {
        const {
          read
        } = context;
        const dep = new CssDependency({
          identifier: read(),
          content: read(),
          media: read(),
          sourceMap: read()
        }, read(), read());
        const assets = read();
        const assetsInfo = read();
        dep.assets = assets;
        dep.assetsInfo = assetsInfo;
        dep.deserialize(context);
        return dep;
      }

    });
    return CssDependency;
  }

  constructor(options = {}) {
    (0, _schemaUtils.validate)(_pluginOptions.default, options, {
      baseDataPath: "options"
    });
    this._sortedModulesCache = new WeakMap();
    this.options = Object.assign({
      filename: DEFAULT_FILENAME,
      ignoreOrder: false,
      experimentalUseImportModule: false
    }, options);
    this.runtimeOptions = {
      insert: options.insert,
      linkType: // Todo in next major release set default to "false"
      options.linkType === true || typeof options.linkType === "undefined" ? "text/css" : options.linkType,
      attributes: options.attributes
    };

    if (!this.options.chunkFilename) {
      const {
        filename
      } = this.options;

      if (typeof filename !== "function") {
        const hasName = filename.includes("[name]");
        const hasId = filename.includes("[id]");
        const hasChunkHash = filename.includes("[chunkhash]");
        const hasContentHash = filename.includes("[contenthash]"); // Anything changing depending on chunk is fine

        if (hasChunkHash || hasContentHash || hasName || hasId) {
          this.options.chunkFilename = filename;
        } else {
          // Otherwise prefix "[id]." in front of the basename to make it changing
          this.options.chunkFilename = filename.replace(/(^|\/)([^/]*(?:\?|$))/, "$1[id].$2");
        }
      } else {
        this.options.chunkFilename = "[id].css";
      }
    }
  }
  /** @param {import("webpack").Compiler} compiler */


  apply(compiler) {
    const {
      webpack
    } = compiler;

    if (this.options.experimentalUseImportModule) {
      if (!compiler.options.experiments) {
        throw new Error("experimentalUseImportModule is only support for webpack >= 5.33.2");
      }

      if (typeof compiler.options.experiments.executeModule === "undefined") {
        // eslint-disable-next-line no-param-reassign
        compiler.options.experiments.executeModule = true;
      }
    } // TODO bug in webpack, remove it after it will be fixed
    // webpack tries to `require` loader firstly when serializer doesn't found


    if (!registered.has(webpack)) {
      registered.add(webpack);
      webpack.util.serialization.registerLoader(/^mini-css-extract-plugin\//, _utils.trueFn);
    }

    const {
      splitChunks
    } = compiler.options.optimization;

    if (splitChunks) {
      if (splitChunks.defaultSizeTypes.includes("...")) {
        splitChunks.defaultSizeTypes.push(_utils.MODULE_TYPE);
      }
    }

    const CssModule = MiniCssExtractPlugin.getCssModule(webpack);
    const CssDependency = MiniCssExtractPlugin.getCssDependency(webpack);
    const {
      NormalModule
    } = compiler.webpack;
    compiler.hooks.compilation.tap(pluginName, compilation => {
      const {
        loader: normalModuleHook
      } = NormalModule.getCompilationHooks(compilation);
      normalModuleHook.tap(pluginName, loaderContext => {
        // eslint-disable-next-line no-param-reassign
        loaderContext[pluginSymbol] = {
          experimentalUseImportModule: this.options.experimentalUseImportModule
        };
      });
    });
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      class CssModuleFactory {
        // eslint-disable-next-line class-methods-use-this
        create({
          dependencies: [dependency]
        }, callback) {
          callback(null, new CssModule(dependency));
        }

      }

      compilation.dependencyFactories.set(CssDependency, new CssModuleFactory());

      class CssDependencyTemplate {
        // eslint-disable-next-line class-methods-use-this
        apply() {}

      }

      compilation.dependencyTemplates.set(CssDependency, new CssDependencyTemplate());
      compilation.hooks.renderManifest.tap(pluginName, (result, {
        chunk
      }) => {
        const {
          chunkGraph
        } = compilation;
        const {
          HotUpdateChunk
        } = webpack; // We don't need hot update chunks for css
        // We will use the real asset instead to update

        if (chunk instanceof HotUpdateChunk) {
          return;
        }

        const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === _utils.MODULE_TYPE);
        const filenameTemplate = chunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;

        if (renderedModules.length > 0) {
          result.push({
            render: () => this.renderContentAsset(compiler, compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener, filenameTemplate, {
              contentHashType: _utils.MODULE_TYPE,
              chunk
            }),
            filenameTemplate,
            pathOptions: {
              chunk,
              contentHashType: _utils.MODULE_TYPE
            },
            identifier: `${pluginName}.${chunk.id}`,
            hash: chunk.contentHash[_utils.MODULE_TYPE]
          });
        }
      });
      compilation.hooks.contentHash.tap(pluginName, chunk => {
        const {
          outputOptions,
          chunkGraph
        } = compilation;
        const modules = this.sortModules(compilation, chunk, chunkGraph.getChunkModulesIterableBySourceType(chunk, _utils.MODULE_TYPE), compilation.runtimeTemplate.requestShortener);

        if (modules) {
          const {
            hashFunction,
            hashDigest,
            hashDigestLength
          } = outputOptions;
          const {
            createHash
          } = compiler.webpack.util;
          const hash = createHash(hashFunction);

          for (const m of modules) {
            hash.update(chunkGraph.getModuleHash(m, chunk.runtime));
          } // eslint-disable-next-line no-param-reassign


          chunk.contentHash[_utils.MODULE_TYPE] = hash.digest(hashDigest).substring(0, hashDigestLength);
        }
      });
      const {
        Template
      } = webpack;
      const {
        RuntimeGlobals,
        runtime
      } = webpack; // eslint-disable-next-line no-shadow

      const getCssChunkObject = (mainChunk, compilation) => {
        const obj = {};
        const {
          chunkGraph
        } = compilation;

        for (const chunk of mainChunk.getAllAsyncChunks()) {
          const modules = chunkGraph.getOrderedChunkModulesIterable(chunk, _utils.compareModulesByIdentifier);

          for (const module of modules) {
            if (module.type === _utils.MODULE_TYPE) {
              obj[chunk.id] = 1;
              break;
            }
          }
        }

        return obj;
      };

      const {
        RuntimeModule
      } = webpack;

      class CssLoadingRuntimeModule extends RuntimeModule {
        constructor(runtimeRequirements, runtimeOptions) {
          super("css loading", 10);
          this.runtimeRequirements = runtimeRequirements;
          this.runtimeOptions = runtimeOptions;
        }

        generate() {
          const {
            chunk,
            runtimeRequirements
          } = this;
          const {
            runtimeTemplate,
            outputOptions: {
              crossOriginLoading
            }
          } = this.compilation;
          const chunkMap = getCssChunkObject(chunk, this.compilation);
          const withLoading = runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers) && Object.keys(chunkMap).length > 0;
          const withHmr = runtimeRequirements.has(RuntimeGlobals.hmrDownloadUpdateHandlers);

          if (!withLoading && !withHmr) {
            return null;
          }

          return Template.asString([`var createStylesheet = ${runtimeTemplate.basicFunction("chunkId, fullhref, resolve, reject", ['var linkTag = document.createElement("link");', this.runtimeOptions.attributes ? Template.asString(Object.entries(this.runtimeOptions.attributes).map(entry => {
            const [key, value] = entry;
            return `linkTag.setAttribute(${JSON.stringify(key)}, ${JSON.stringify(value)});`;
          })) : "", 'linkTag.rel = "stylesheet";', this.runtimeOptions.linkType ? `linkTag.type = ${JSON.stringify(this.runtimeOptions.linkType)};` : "", `var onLinkComplete = ${runtimeTemplate.basicFunction("event", ["// avoid mem leaks.", "linkTag.onerror = linkTag.onload = null;", "if (event.type === 'load') {", Template.indent(["resolve();"]), "} else {", Template.indent(["var errorType = event && (event.type === 'load' ? 'missing' : event.type);", "var realHref = event && event.target && event.target.href || fullhref;", 'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + realHref + ")");', 'err.code = "CSS_CHUNK_LOAD_FAILED";', "err.type = errorType;", "err.request = realHref;", "linkTag.parentNode.removeChild(linkTag)", "reject(err);"]), "}"])}`, "linkTag.onerror = linkTag.onload = onLinkComplete;", "linkTag.href = fullhref;", crossOriginLoading ? Template.asString([`if (linkTag.href.indexOf(window.location.origin + '/') !== 0) {`, Template.indent(`linkTag.crossOrigin = ${JSON.stringify(crossOriginLoading)};`), "}"]) : "", typeof this.runtimeOptions.insert !== "undefined" ? typeof this.runtimeOptions.insert === "function" ? `(${this.runtimeOptions.insert.toString()})(linkTag)` : Template.asString([`var target = document.querySelector("${this.runtimeOptions.insert}");`, `target.parentNode.insertBefore(linkTag, target.nextSibling);`]) : Template.asString(["document.head.appendChild(linkTag);"]), "return linkTag;"])};`, `var findStylesheet = ${runtimeTemplate.basicFunction("href, fullhref", ['var existingLinkTags = document.getElementsByTagName("link");', "for(var i = 0; i < existingLinkTags.length; i++) {", Template.indent(["var tag = existingLinkTags[i];", 'var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");', 'if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return tag;']), "}", 'var existingStyleTags = document.getElementsByTagName("style");', "for(var i = 0; i < existingStyleTags.length; i++) {", Template.indent(["var tag = existingStyleTags[i];", 'var dataHref = tag.getAttribute("data-href");', "if(dataHref === href || dataHref === fullhref) return tag;"]), "}"])};`, `var loadStylesheet = ${runtimeTemplate.basicFunction("chunkId", `return new Promise(${runtimeTemplate.basicFunction("resolve, reject", [`var href = ${RuntimeGlobals.require}.miniCssF(chunkId);`, `var fullhref = ${RuntimeGlobals.publicPath} + href;`, "if(findStylesheet(href, fullhref)) return resolve();", "createStylesheet(chunkId, fullhref, resolve, reject);"])});`)}`, withLoading ? Template.asString(["// object to store loaded CSS chunks", "var installedCssChunks = {", Template.indent(chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(",\n")), "};", "", `${RuntimeGlobals.ensureChunkHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkId, promises", [`var cssChunks = ${JSON.stringify(chunkMap)};`, "if(installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);", "else if(installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {", Template.indent([`promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId).then(${runtimeTemplate.basicFunction("", "installedCssChunks[chunkId] = 0;")}, ${runtimeTemplate.basicFunction("e", ["delete installedCssChunks[chunkId];", "throw e;"])}));`]), "}"])};`]) : "// no chunk loading", "", withHmr ? Template.asString(["var oldTags = [];", "var newTags = [];", `var applyHandler = ${runtimeTemplate.basicFunction("options", [`return { dispose: ${runtimeTemplate.basicFunction("", ["for(var i = 0; i < oldTags.length; i++) {", Template.indent(["var oldTag = oldTags[i];", "if(oldTag.parentNode) oldTag.parentNode.removeChild(oldTag);"]), "}", "oldTags.length = 0;"])}, apply: ${runtimeTemplate.basicFunction("", ['for(var i = 0; i < newTags.length; i++) newTags[i].rel = "stylesheet";', "newTags.length = 0;"])} };`])}`, `${RuntimeGlobals.hmrDownloadUpdateHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList", ["applyHandlers.push(applyHandler);", `chunkIds.forEach(${runtimeTemplate.basicFunction("chunkId", [`var href = ${RuntimeGlobals.require}.miniCssF(chunkId);`, `var fullhref = ${RuntimeGlobals.publicPath} + href;`, "var oldTag = findStylesheet(href, fullhref);", "if(!oldTag) return;", `promises.push(new Promise(${runtimeTemplate.basicFunction("resolve, reject", [`var tag = createStylesheet(chunkId, fullhref, ${runtimeTemplate.basicFunction("", ['tag.as = "style";', 'tag.rel = "preload";', "resolve();"])}, reject);`, "oldTags.push(oldTag);", "newTags.push(tag);"])}));`])});`])}`]) : "// no hmr"]);
        }

      }

      const enabledChunks = new WeakSet();

      const handler = (chunk, set) => {
        if (enabledChunks.has(chunk)) {
          return;
        }

        enabledChunks.add(chunk);

        if (typeof this.options.chunkFilename === "string" && /\[(full)?hash(:\d+)?\]/.test(this.options.chunkFilename)) {
          set.add(RuntimeGlobals.getFullHash);
        }

        set.add(RuntimeGlobals.publicPath);
        compilation.addRuntimeModule(chunk, new runtime.GetChunkFilenameRuntimeModule(_utils.MODULE_TYPE, "mini-css", `${RuntimeGlobals.require}.miniCssF`, referencedChunk => {
          if (!referencedChunk.contentHash[_utils.MODULE_TYPE]) {
            return false;
          }

          return referencedChunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;
        }, true));
        compilation.addRuntimeModule(chunk, new CssLoadingRuntimeModule(set, this.runtimeOptions));
      };

      compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap(pluginName, handler);
      compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadUpdateHandlers).tap(pluginName, handler);
    });
  }

  getChunkModules(chunk, chunkGraph) {
    return typeof chunkGraph !== "undefined" ? chunkGraph.getOrderedChunkModulesIterable(chunk, _utils.compareModulesByIdentifier) : chunk.modulesIterable;
  }

  sortModules(compilation, chunk, modules, requestShortener) {
    let usedModules = this._sortedModulesCache.get(chunk);

    if (usedModules || !modules) {
      return usedModules;
    }

    const modulesList = [...modules]; // Store dependencies for modules

    const moduleDependencies = new Map(modulesList.map(m => [m, new Set()]));
    const moduleDependenciesReasons = new Map(modulesList.map(m => [m, new Map()])); // Get ordered list of modules per chunk group
    // This loop also gathers dependencies from the ordered lists
    // Lists are in reverse order to allow to use Array.pop()

    const modulesByChunkGroup = Array.from(chunk.groupsIterable, chunkGroup => {
      const sortedModules = modulesList.map(module => {
        return {
          module,
          index: chunkGroup.getModulePostOrderIndex(module)
        };
      }) // eslint-disable-next-line no-undefined
      .filter(item => item.index !== undefined).sort((a, b) => b.index - a.index).map(item => item.module);

      for (let i = 0; i < sortedModules.length; i++) {
        const set = moduleDependencies.get(sortedModules[i]);
        const reasons = moduleDependenciesReasons.get(sortedModules[i]);

        for (let j = i + 1; j < sortedModules.length; j++) {
          const module = sortedModules[j];
          set.add(module);
          const reason = reasons.get(module) || new Set();
          reason.add(chunkGroup);
          reasons.set(module, reason);
        }
      }

      return sortedModules;
    }); // set with already included modules in correct order

    usedModules = new Set();

    const unusedModulesFilter = m => !usedModules.has(m);

    while (usedModules.size < modulesList.length) {
      let success = false;
      let bestMatch;
      let bestMatchDeps; // get first module where dependencies are fulfilled

      for (const list of modulesByChunkGroup) {
        // skip and remove already added modules
        while (list.length > 0 && usedModules.has(list[list.length - 1])) {
          list.pop();
        } // skip empty lists


        if (list.length !== 0) {
          const module = list[list.length - 1];
          const deps = moduleDependencies.get(module); // determine dependencies that are not yet included

          const failedDeps = Array.from(deps).filter(unusedModulesFilter); // store best match for fallback behavior

          if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
            bestMatch = list;
            bestMatchDeps = failedDeps;
          }

          if (failedDeps.length === 0) {
            // use this module and remove it from list
            usedModules.add(list.pop());
            success = true;
            break;
          }
        }
      }

      if (!success) {
        // no module found => there is a conflict
        // use list with fewest failed deps
        // and emit a warning
        const fallbackModule = bestMatch.pop();

        if (!this.options.ignoreOrder) {
          const reasons = moduleDependenciesReasons.get(fallbackModule);
          compilation.warnings.push(new Error([`chunk ${chunk.name || chunk.id} [${pluginName}]`, "Conflicting order. Following module has been added:", ` * ${fallbackModule.readableIdentifier(requestShortener)}`, "despite it was not able to fulfill desired ordering with these modules:", ...bestMatchDeps.map(m => {
            const goodReasonsMap = moduleDependenciesReasons.get(m);
            const goodReasons = goodReasonsMap && goodReasonsMap.get(fallbackModule);
            const failedChunkGroups = Array.from(reasons.get(m), cg => cg.name).join(", ");
            const goodChunkGroups = goodReasons && Array.from(goodReasons, cg => cg.name).join(", ");
            return [` * ${m.readableIdentifier(requestShortener)}`, `   - couldn't fulfill desired order of chunk group(s) ${failedChunkGroups}`, goodChunkGroups && `   - while fulfilling desired order of chunk group(s) ${goodChunkGroups}`].filter(Boolean).join("\n");
          })].join("\n")));
        }

        usedModules.add(fallbackModule);
      }
    }

    this._sortedModulesCache.set(chunk, usedModules);

    return usedModules;
  }

  renderContentAsset(compiler, compilation, chunk, modules, requestShortener, filenameTemplate, pathData) {
    const usedModules = this.sortModules(compilation, chunk, modules, requestShortener);
    const {
      ConcatSource,
      SourceMapSource,
      RawSource
    } = compiler.webpack.sources;
    const source = new ConcatSource();
    const externalsSource = new ConcatSource();

    for (const module of usedModules) {
      let content = module.content.toString();
      const readableIdentifier = module.readableIdentifier(requestShortener);
      const startsWithAtRuleImport = /^@import url/.test(content);
      let header;

      if (compilation.outputOptions.pathinfo) {
        // From https://github.com/webpack/webpack/blob/29eff8a74ecc2f87517b627dee451c2af9ed3f3f/lib/ModuleInfoHeaderPlugin.js#L191-L194
        const reqStr = readableIdentifier.replace(/\*\//g, "*_/");
        const reqStrStar = "*".repeat(reqStr.length);
        const headerStr = `/*!****${reqStrStar}****!*\\\n  !*** ${reqStr} ***!\n  \\****${reqStrStar}****/\n`;
        header = new RawSource(headerStr);
      }

      if (startsWithAtRuleImport) {
        if (typeof header !== "undefined") {
          externalsSource.add(header);
        } // HACK for IE
        // http://stackoverflow.com/a/14676665/1458162


        if (module.media) {
          // insert media into the @import
          // this is rar
          // TODO improve this and parse the CSS to support multiple medias
          content = content.replace(/;|\s*$/, module.media);
        }

        externalsSource.add(content);
        externalsSource.add("\n");
      } else {
        if (typeof header !== "undefined") {
          source.add(header);
        }

        if (module.media) {
          source.add(`@media ${module.media} {\n`);
        }

        const {
          path: filename
        } = compilation.getPathWithInfo(filenameTemplate, pathData);
        const undoPath = (0, _identifier.getUndoPath)(filename, compiler.outputPath, false);
        content = content.replace(new RegExp(_utils.ABSOLUTE_PUBLIC_PATH, "g"), "");
        content = content.replace(new RegExp(_utils.SINGLE_DOT_PATH_SEGMENT, "g"), ".");
        content = content.replace(new RegExp(_utils.DOUBLE_DOT_PATH_SEGMENT, "g"), "..");
        content = content.replace(new RegExp(_utils.AUTO_PUBLIC_PATH, "g"), undoPath);

        if (module.sourceMap) {
          source.add(new SourceMapSource(content, readableIdentifier, module.sourceMap.toString()));
        } else {
          source.add(new RawSource(content, readableIdentifier));
        }

        source.add("\n");

        if (module.media) {
          source.add("}\n");
        }
      }
    }

    return new ConcatSource(externalsSource, source);
  }

}

MiniCssExtractPlugin.loader = __nccwpck_require__.ab + "loader.js";
var _default = MiniCssExtractPlugin;
exports.default = _default;
}();
module.exports = __webpack_exports__;
/******/ })()
;