/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = window.React;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = window.assert;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = window.ReactRouterDOM;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(11);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = window.ReactDOM;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(10),
    getPrototype = __webpack_require__(16),
    isObjectLike = __webpack_require__(18);

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = 'foo';

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);



 // runtime plugins

window.g_plugins = __webpack_require__(9);
window.g_plugins.init({
  validKeys: ['patchRoutes', 'render', 'rootContainer', 'modifyRouteProps', 'onRouteChange']
}); // render

var oldRender = () => {
  var rootContainer = window.g_plugins.apply('rootContainer', {
    initialValue: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(__webpack_require__(20).default)
  });
  react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(rootContainer, document.getElementById('root'));
};

var render = window.g_plugins.compose('render', {
  initialValue: oldRender
});
var moduleBeforeRendererPromises = [];
Promise.all(moduleBeforeRendererPromises).then(() => {
  render();
}).catch(err => {
  window.console && window.console.error(err);
}); // hot module replacement

if (false) {}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "use", function() { return use; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getItem", function() { return getItem; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compose", function() { return compose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "apply", function() { return apply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyForEach", function() { return applyForEach; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeConfig", function() { return mergeConfig; });
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(assert__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_1__);
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }



var plugins = null;
var validKeys = [];
function init() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  plugins = [];
  validKeys = opts.validKeys || [];
}
function use(plugin) {
  Object.keys(plugin).forEach(function (key) {
    // TODO: remove default
    // default 是为了兼容内部框架内置的一个 babel 插件问题
    assert__WEBPACK_IMPORTED_MODULE_0___default()(validKeys.concat('default').indexOf(key) > -1, "Invalid key ".concat(key, " from plugin"));
  });
  plugins.push(plugin);
}
function getItem(key) {
  assert__WEBPACK_IMPORTED_MODULE_0___default()(validKeys.indexOf(key) > -1, "Invalid key ".concat(key));
  return plugins.filter(function (plugin) {
    return key in plugin;
  }).map(function (plugin) {
    return plugin[key];
  });
}

function _compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs.pop();
  return funcs.reduce(function (a, b) {
    return function () {
      return b(a);
    };
  }, last);
}

function compose(item, _ref) {
  var initialValue = _ref.initialValue;
  if (typeof item === 'string') item = getItem(item);
  return function () {
    return _compose.apply(void 0, _toConsumableArray(item).concat([initialValue]))();
  };
}
function apply(item, _ref2) {
  var initialValue = _ref2.initialValue,
      args = _ref2.args;
  if (typeof item === 'string') item = getItem(item);
  assert__WEBPACK_IMPORTED_MODULE_0___default()(Array.isArray(item), "item must be Array");
  return item.reduce(function (memo, fn) {
    assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof fn === 'function', "applied item must be function");
    return fn(memo, args);
  }, initialValue);
}
function applyForEach(item, _ref3) {
  var initialValue = _ref3.initialValue;
  if (typeof item === 'string') item = getItem(item);
  assert__WEBPACK_IMPORTED_MODULE_0___default()(Array.isArray(item), "item must be Array");
  item.forEach(function (fn) {
    assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof fn === 'function', "applied item must be function");
    fn(initialValue);
  });
} // shadow merge

function mergeConfig(item) {
  if (typeof item === 'string') item = getItem(item);
  assert__WEBPACK_IMPORTED_MODULE_0___default()(Array.isArray(item), "item must be Array");
  return item.reduce(function (memo, config) {
    assert__WEBPACK_IMPORTED_MODULE_0___default()(lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_1___default()(config), "Config is not plain object");
    return _objectSpread({}, memo, config);
  }, {});
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(3),
    getRawTag = __webpack_require__(14),
    objectToString = __webpack_require__(15);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(12);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(13)))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(3);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(17);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _foo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _foo__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_foo__WEBPACK_IMPORTED_MODULE_1__);


/* harmony default export */ __webpack_exports__["default"] = (function () {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, "Index Page ", _foo__WEBPACK_IMPORTED_MODULE_1___default.a));
});

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "window.React"
var external_window_React_ = __webpack_require__(0);
var external_window_React_default = /*#__PURE__*/__webpack_require__.n(external_window_React_);

// EXTERNAL MODULE: external "window.ReactRouterDOM"
var external_window_ReactRouterDOM_ = __webpack_require__(2);

// CONCATENATED MODULE: ./packages/umi/lib/renderRoutes.js
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var RouteInstanceMap = {
  get: function get(key) {
    return key._routeInternalComponent;
  },
  has: function has(key) {
    return key._routeInternalComponent !== undefined;
  },
  set: function set(key, value) {
    key._routeInternalComponent = value;
  }
}; // Support pass props from layout to child routes

var renderRoutes_RouteWithProps = function RouteWithProps(_ref) {
  var path = _ref.path,
      exact = _ref.exact,
      strict = _ref.strict,
      _render = _ref.render,
      location = _ref.location,
      rest = _objectWithoutProperties(_ref, ["path", "exact", "strict", "render", "location"]);

  return external_window_React_default.a.createElement(external_window_ReactRouterDOM_["Route"], {
    path: path,
    exact: exact,
    strict: strict,
    location: location,
    render: function render(props) {
      return _render(_objectSpread({}, props, rest));
    }
  });
};

function getCompatProps(props) {
  var compatProps = {};

  if (undefined) {
    if (props.match && props.match.params && !props.params) {
      compatProps.params = props.match.params;
    }
  }

  return compatProps;
}

function withRoutes(route) {
  if (RouteInstanceMap.has(route)) {
    return RouteInstanceMap.get(route);
  }

  var Routes = route.Routes;
  var len = Routes.length - 1;

  var Component = function Component(args) {
    var render = args.render,
        props = _objectWithoutProperties(args, ["render"]);

    return render(props);
  };

  var _loop = function _loop() {
    var AuthRoute = Routes[len];
    var OldComponent = Component;

    Component = function Component(props) {
      return external_window_React_default.a.createElement(AuthRoute, props, external_window_React_default.a.createElement(OldComponent, props));
    };

    len -= 1;
  };

  while (len >= 0) {
    _loop();
  }

  var ret = function ret(args) {
    var _render2 = args.render,
        rest = _objectWithoutProperties(args, ["render"]);

    return external_window_React_default.a.createElement(renderRoutes_RouteWithProps, _extends({}, rest, {
      render: function render(props) {
        return external_window_React_default.a.createElement(Component, _extends({}, props, {
          route: route,
          render: _render2
        }));
      }
    }));
  };

  RouteInstanceMap.set(route, ret);
  return ret;
}

function renderRoutes(routes) {
  var extraProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var switchProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return routes ? external_window_React_default.a.createElement(external_window_ReactRouterDOM_["Switch"], switchProps, routes.map(function (route, i) {
    if (route.redirect) {
      return external_window_React_default.a.createElement(external_window_ReactRouterDOM_["Redirect"], {
        key: route.key || i,
        from: route.path,
        to: route.redirect,
        exact: route.exact,
        strict: route.strict
      });
    }

    var RouteRoute = route.Routes ? withRoutes(route) : renderRoutes_RouteWithProps;
    return external_window_React_default.a.createElement(RouteRoute, {
      key: route.key || i,
      path: route.path,
      exact: route.exact,
      strict: route.strict,
      render: function render(props) {
        var childRoutes = renderRoutes(route.routes, {}, {
          location: props.location
        });

        if (route.component) {
          var compatProps = getCompatProps(_objectSpread({}, props, extraProps));
          var newProps = window.g_plugins.apply('modifyRouteProps', {
            initialValue: _objectSpread({}, props, extraProps, compatProps),
            args: {
              route: route
            }
          });
          return external_window_React_default.a.createElement(route.component, _extends({}, newProps, {
            route: route
          }), childRoutes);
        } else {
          return childRoutes;
        }
      }
    });
  })) : null;
}
// CONCATENATED MODULE: ./packages/umi/test/fixtures/build/tree-shaking-with-cjs/pages/.umi-production/router.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RouterWrapper; });




var Router = external_window_ReactRouterDOM_["Router"];
var router_routes = [{
  "path": "/",
  "exact": true,
  "component": __webpack_require__(19).default
}];
window.g_routes = router_routes;
window.g_plugins.applyForEach('patchRoutes', {
  initialValue: router_routes
}); // route change handler

function routeChangeHandler(location, action) {
  window.g_plugins.applyForEach('onRouteChange', {
    initialValue: {
      routes: router_routes,
      location,
      action
    }
  });
}

window.g_history.listen(routeChangeHandler);
routeChangeHandler(window.g_history.location);
function RouterWrapper() {
  return external_window_React_default.a.createElement(Router, {
    history: window.g_history
  }, renderRoutes(router_routes, {}));
}

/***/ })
/******/ ]);