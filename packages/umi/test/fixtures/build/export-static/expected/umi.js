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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
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
/***/ (function(module, exports) {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (true) {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === "/" ? path : "/" + path;
};

var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
  return path.charAt(0) === "/" ? path.substr(1) : path;
};

var hasBasename = exports.hasBasename = function hasBasename(path, prefix) {
  return new RegExp("^" + prefix + "(\\/|\\?|#|$)", "i").test(path);
};

var stripBasename = exports.stripBasename = function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
};

var stripTrailingSlash = exports.stripTrailingSlash = function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === "/" ? path.slice(0, -1) : path;
};

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = path || "/";
  var search = "";
  var hash = "";

  var hashIndex = pathname.indexOf("#");
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf("?");
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === "?" ? "" : search,
    hash: hash === "#" ? "" : hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;


  var path = pathname || "/";

  if (search && search !== "?") path += search.charAt(0) === "?" ? search : "?" + search;

  if (hash && hash !== "#") path += hash.charAt(0) === "#" ? hash : "#" + hash;

  return path;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(28);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(3);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _react = _interopRequireDefault(__webpack_require__(0));

var _link = _interopRequireDefault(__webpack_require__(39));

function _default() {
  return _react.default.createElement("div", null, _react.default.createElement("h1", null, "Index Page"), _react.default.createElement(_link.default, {
    to: "/list"
  }, _react.default.createElement("button", {
    type: "primary"
  }, "\u8DF3\u8F6C\u5230\u5217\u8868\u9875")));
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(4);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(15);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(16);

var _PathUtils = __webpack_require__(5);

var _createTransitionManager = __webpack_require__(23);

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = __webpack_require__(24);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = "popstate";
var HashChangeEvent = "hashchange";

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, "Browser history needs a DOM");

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$forceRefresh = props.forceRefresh,
      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
      _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : "";

  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;


    var path = pathname + search + hash;

    (0, _warning2.default)(!basename || (0, _PathUtils.hasBasename)(path, basename), "You are attempting to use a basename on a page whose URL path does not begin " + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

    if (basename) path = (0, _PathUtils.stripBasename)(path, basename);

    return (0, _LocationUtils.createLocation)(path, state, key);
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var handlePopState = function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;

    handlePop(getDOMLocation(event.state));
  };

  var handleHashChange = function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  };

  var forceNextPop = false;

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = "POP";

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allKeys.indexOf(fromLocation.key);

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key];

  // Public interface

  var createHref = function createHref(location) {
    return basename + (0, _PathUtils.createPath)(location);
  };

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === "undefined" ? "undefined" : _typeof(path)) === "object" && path.state !== undefined && state !== undefined), "You should avoid providing a 2nd state argument to push when the 1st " + "argument is a location-like object that already has state; it is ignored");

    var action = "PUSH";
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, "Browser history cannot push state in browsers that do not support HTML5 history");

        window.location.href = href;
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === "undefined" ? "undefined" : _typeof(path)) === "object" && path.state !== undefined && state !== undefined), "You should avoid providing a 2nd state argument to replace when the 1st " + "argument is a location-like object that already has state; it is ignored");

    var action = "REPLACE";
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, "Browser history cannot replace state in browsers that do not support HTML5 history");

        window.location.replace(href);
      }
    });
  };

  var go = function go(n) {
    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      window.addEventListener(PopStateEvent, handlePopState);

      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);

      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: "POP",
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createBrowserHistory;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(27),
    getPrototype = __webpack_require__(33),
    isObjectLike = __webpack_require__(35);

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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(11);


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(3);

__webpack_require__(12);

__webpack_require__(13);

var _react = _interopRequireDefault(__webpack_require__(0));

var _reactDom = _interopRequireDefault(__webpack_require__(25));

// runtime plugins
window.g_plugins = __webpack_require__(26);
window.g_plugins.init({
  validKeys: ['patchRoutes', 'render', 'rootContainer', 'modifyRouteProps', 'onRouteChange']
}); // render

var oldRender = () => {
  var rootContainer = window.g_plugins.apply('rootContainer', {
    initialValue: _react.default.createElement(__webpack_require__(36).default)
  });

  _reactDom.default.render(rootContainer, document.getElementById('root'));
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.array.from'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.array.includes'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.array.sort'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.array.species'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.date.to-primitive'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.function.has-instance'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.map'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.define-getter'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.define-setter'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.entries'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.get-own-property-descriptors'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.lookup-getter'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.lookup-setter'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.object.values'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.promise'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.promise.finally'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.flags'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.match'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.replace'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.split'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.search'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.regexp.to-string'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.set'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.symbol'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.symbol.async-iterator'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.string.pad-start'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es7.string.pad-end'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.array-buffer'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.int8-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.uint8-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.uint8-clamped-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.int16-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.uint16-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.int32-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.uint32-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.float32-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.typed.float64-array'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.weak-map'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/es6.weak-set'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/web.timers'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/web.immediate'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'core-js/modules/web.dom.iterable'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'regenerator-runtime/runtime'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// create history
window.g_history = __webpack_require__(14).default({
  basename: window.routerBase
});

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var history_createBrowserHistory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var history_createBrowserHistory__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(history_createBrowserHistory__WEBPACK_IMPORTED_MODULE_0__);


/* harmony default export */ __webpack_exports__["default"] = (function (opts) {
  var history = history_createBrowserHistory__WEBPACK_IMPORTED_MODULE_0___default()(opts);

  if (false) { var oldReplace, oldPush; }

  return history;
});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (true) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.locationsAreEqual = exports.createLocation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _resolvePathname = __webpack_require__(17);

var _resolvePathname2 = _interopRequireDefault(_resolvePathname);

var _valueEqual = __webpack_require__(18);

var _valueEqual2 = _interopRequireDefault(_valueEqual);

var _PathUtils = __webpack_require__(5);

var _queryString = __webpack_require__(19);

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
  var location = void 0;
  if (typeof path === "string") {
    // Two-arg form: push(path, state)
    location = (0, _PathUtils.parsePath)(path);
    location.query = location.search ? _queryString2.default.parse(location.search) : {};
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (location.pathname === undefined) location.pathname = "";

    if (location.search) {
      if (location.search.charAt(0) !== "?") {
        location.search = "?" + location.search;
      }
      location.query = _queryString2.default.parse(location.search);
    } else {
      location.search = location.query ? _queryString2.default.stringify(location.query) : "";
      location.query = location.query || {};
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== "#") location.hash = "#" + location.hash;
    } else {
      location.hash = "";
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + "This is likely caused by an invalid percent-encoding.");
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== "/") {
      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = "/";
    }
  }

  return location;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
};

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
}

// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
}

// This implementation is based heavily on node's url.parse
function resolvePathname(to) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];

  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  var hasTrailingSlash = void 0;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) {
    fromParts.unshift('..');
  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
}

/* harmony default export */ __webpack_exports__["default"] = (resolvePathname);

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function valueEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
      return valueEqual(item, b[index]);
    });
  }

  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (aType !== bType) return false;

  if (aType === 'object') {
    var aValue = a.valueOf();
    var bValue = b.valueOf();

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(function (key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
}

/* harmony default export */ __webpack_exports__["default"] = (valueEqual);

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strictUriEncode = __webpack_require__(20);
var objectAssign = __webpack_require__(21);
var decodeComponent = __webpack_require__(22);

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

function extract(str) {
	var queryStart = str.indexOf('?');
	if (queryStart === -1) {
		return '';
	}
	return str.slice(queryStart + 1);
}

function parse(str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^[?#&]/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeComponent(val);

		formatter(decodeComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	if (opts.sort === false) {
		opts.sort = function () {};
	}

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

exports.parseUrl = function (str, opts) {
	return {
		url: str.split('?')[0] || '',
		query: parse(extract(str), opts)
	};
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

module.exports = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _warning = __webpack_require__(4);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createTransitionManager = function createTransitionManager() {
  var prompt = null;

  var setPrompt = function setPrompt(nextPrompt) {
    (0, _warning2.default)(prompt == null, "A history supports only one prompt at a time");

    prompt = nextPrompt;

    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === "function" ? prompt(location, action) : prompt;

      if (typeof result === "string") {
        if (typeof getUserConfirmation === "function") {
          getUserConfirmation(result, callback);
        } else {
          (0, _warning2.default)(false, "A history needs a getUserConfirmation function in order to use a prompt message");

          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  };

  var listeners = [];

  var appendListener = function appendListener(fn) {
    var isActive = true;

    var listener = function listener() {
      if (isActive) fn.apply(undefined, arguments);
    };

    listeners.push(listener);

    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(undefined, args);
    });
  };

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
};

exports.default = createTransitionManager;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) && ua.indexOf("Mobile Safari") !== -1 && ua.indexOf("Chrome") === -1 && ua.indexOf("Windows Phone") === -1) return false;

  return window.history && "pushState" in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf("Trident") === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf("Firefox") === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf("CriOS") === -1;
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = window.ReactDOM;

/***/ }),
/* 26 */
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
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(6),
    getRawTag = __webpack_require__(31),
    objectToString = __webpack_require__(32);

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
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(29);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 30 */
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
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(6);

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
/* 32 */
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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(34);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 34 */
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
/* 35 */
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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(3);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RouterWrapper;

var _react = _interopRequireDefault(__webpack_require__(0));

var _reactRouterDom = __webpack_require__(2);

var _dynamic = _interopRequireDefault(__webpack_require__(37));

var _renderRoutes = _interopRequireDefault(__webpack_require__(38));

var Router = _reactRouterDom.Router;
var routes = [{
  "path": "/index.html",
  "exact": true,
  "component": __webpack_require__(7).default
}, {
  "path": "/",
  "exact": true,
  "component": __webpack_require__(7).default
}, {
  "path": "/list",
  "exact": true,
  "component": __webpack_require__(40).default
}];
window.g_routes = routes;
window.g_plugins.applyForEach('patchRoutes', {
  initialValue: routes
}); // route change handler

function routeChangeHandler(location, action) {
  window.g_plugins.applyForEach('onRouteChange', {
    initialValue: {
      routes,
      location,
      action
    }
  });
}

window.g_history.listen(routeChangeHandler);
routeChangeHandler(window.g_history.location);

function RouterWrapper() {
  return _react.default.createElement(Router, {
    history: window.g_history
  }, (0, _renderRoutes.default)(routes, {}));
}

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
!(function webpackMissingModule() { var e = new Error("Cannot find module 'react-loadable'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


 // Thanks to next.js
// ref: https://github.com/zeit/next.js/blob/canary/lib/dynamic.js

/* harmony default export */ __webpack_exports__["default"] = (function (dynamicOptions, options) {
  var loadableFn = !(function webpackMissingModule() { var e = new Error("Cannot find module 'react-loadable'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
  var loadableOptions = {
    loading: function loading(_ref) {
      var error = _ref.error,
          isLoading = _ref.isLoading;

      if (false) {}

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", null, "loading...");
    }
  }; // Support for direct import(),
  // eg: dynamic(import('../hello-world'))

  if (typeof dynamicOptions.then === 'function') {
    loadableOptions.loader = function () {
      return dynamicOptions;
    }; // Support for having first argument being options,
    // eg: dynamic({loader: import('../hello-world')})

  } else if (_typeof(dynamicOptions) === 'object') {
    loadableOptions = _objectSpread({}, loadableOptions, dynamicOptions);
  } // Support for passing options,
  // eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})


  loadableOptions = _objectSpread({}, loadableOptions, options); // Support for `render` when using a mapping,
  // eg: `dynamic({ modules: () => {return {HelloWorld: import('../hello-world')}, render(props, loaded) {} } })

  if (dynamicOptions.render) {
    loadableOptions.render = function (loaded, props) {
      return dynamicOptions.render(props, loaded);
    };
  } // Support for `modules` when using a mapping,
  // eg: `dynamic({ modules: () => {return {HelloWorld: import('../hello-world')}, render(props, loaded) {} } })


  if (dynamicOptions.modules) {
    loadableFn = !(function webpackMissingModule() { var e = new Error("Cannot find module 'react-loadable'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).Map;
    var loadModules = {};
    var modules = dynamicOptions.modules();
    Object.keys(modules).forEach(function (key) {
      var value = modules[key];

      if (typeof value.then === 'function') {
        loadModules[key] = function () {
          return value.then(function (mod) {
            return mod.default || mod;
          });
        };

        return;
      }

      loadModules[key] = value;
    });
    loadableOptions.loader = loadModules;
  }

  return loadableFn(loadableOptions);
});

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return renderRoutes; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_1__);
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

var RouteWithProps = function RouteWithProps(_ref) {
  var path = _ref.path,
      exact = _ref.exact,
      strict = _ref.strict,
      _render = _ref.render,
      location = _ref.location,
      rest = _objectWithoutProperties(_ref, ["path", "exact", "strict", "render", "location"]);

  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
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
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(AuthRoute, props, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(OldComponent, props));
    };

    len -= 1;
  };

  while (len >= 0) {
    _loop();
  }

  var ret = function ret(args) {
    var _render2 = args.render,
        rest = _objectWithoutProperties(args, ["render"]);

    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(RouteWithProps, _extends({}, rest, {
      render: function render(props) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Component, _extends({}, props, {
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
  return routes ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Switch"], switchProps, routes.map(function (route, i) {
    if (route.redirect) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Redirect"], {
        key: route.key || i,
        from: route.path,
        to: route.redirect,
        exact: route.exact,
        strict: route.strict
      });
    }

    var RouteRoute = route.Routes ? withRoutes(route) : RouteWithProps;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(RouteRoute, {
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
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(route.component, _extends({}, newProps, {
            route: route
          }), childRoutes);
        } else {
          return childRoutes;
        }
      }
    });
  })) : null;
}

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ __webpack_exports__["default"] = (react_router_dom__WEBPACK_IMPORTED_MODULE_0__["Link"]);

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(3);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _react = _interopRequireDefault(__webpack_require__(0));

var _router = _interopRequireDefault(__webpack_require__(41));

function _default() {
  return _react.default.createElement("div", null, _react.default.createElement("h1", null, "List Page"), _react.default.createElement("button", {
    onClick: () => {
      _router.default.goBack();
    }
  }, "\u8FD4\u56DE"));
}

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "push", function() { return push; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "replace", function() { return replace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "go", function() { return go; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "goBack", function() { return goBack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "goForward", function() { return goForward; });
/* global window */
function push() {
  var _window$g_history;

  (_window$g_history = window.g_history).push.apply(_window$g_history, arguments);
}
function replace() {
  var _window$g_history2;

  (_window$g_history2 = window.g_history).replace.apply(_window$g_history2, arguments);
}
function go() {
  var _window$g_history3;

  (_window$g_history3 = window.g_history).go.apply(_window$g_history3, arguments);
}
function goBack() {
  var _window$g_history4;

  (_window$g_history4 = window.g_history).goBack.apply(_window$g_history4, arguments);
}
function goForward() {
  var _window$g_history5;

  (_window$g_history5 = window.g_history).goForward.apply(_window$g_history5, arguments);
}
/* harmony default export */ __webpack_exports__["default"] = ({
  push: push,
  replace: replace,
  go: go,
  goBack: goBack,
  goForward: goForward
});

/***/ })
/******/ ]);