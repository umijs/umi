function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
import stripAnsi from '@umijs/utils/compiled/strip-ansi';
// @ts-ignore
import * as ErrorOverlay from 'react-error-overlay';
import { MESSAGE_TYPE } from "../constants";
import { formatWebpackMessages } from "../utils/formatWebpackMessages";
console.log('[webpack] connecting...');
function getHost() {
  if (process.env.SOCKET_SERVER) {
    return new URL(process.env.SOCKET_SERVER);
  }
  return location;
}
function getSocketUrl() {
  var h = getHost();
  var host = h.host;
  var isHttps = h.protocol === 'https:';
  return "".concat(isHttps ? 'wss' : 'ws', "://").concat(host);
}
function getPingUrl() {
  var h = getHost();
  return "".concat(h.protocol, "//").concat(h.host, "/__umi_ping");
}
var pingTimer = null;
var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;
var hadRuntimeError = false;
var pingUrl = getPingUrl();
var socket = new WebSocket(getSocketUrl(), 'webpack-hmr');
socket.addEventListener('message', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
    var data;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          data = _ref.data;
          data = JSON.parse(data);
          if (data.type === 'connected') {
            console.log("[webpack] connected.");
            // proxy(nginx, docker) hmr ws maybe caused timeout,
            // so send ping package let ws keep alive.
            pingTimer = window.setInterval(function () {
              return socket.send('ping');
            }, 30000);
          } else {
            handleMessage(data).catch(console.error);
          }
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());
function waitForSuccessfulPing() {
  return _waitForSuccessfulPing.apply(this, arguments);
}
function _waitForSuccessfulPing() {
  _waitForSuccessfulPing = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    var ms,
      _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          ms = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : 1000;
        case 1:
          if (!true) {
            _context3.next = 14;
            break;
          }
          _context3.prev = 2;
          _context3.next = 5;
          return fetch(pingUrl);
        case 5:
          return _context3.abrupt("break", 14);
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](2);
          _context3.next = 12;
          return new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          });
        case 12:
          _context3.next = 1;
          break;
        case 14:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[2, 8]]);
  }));
  return _waitForSuccessfulPing.apply(this, arguments);
}
socket.addEventListener('close', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        if (pingTimer) clearInterval(pingTimer);
        console.info('[webpack] Dev server disconnected. Polling for restart...');
        _context2.next = 4;
        return waitForSuccessfulPing();
      case 4:
        location.reload();
      case 5:
      case "end":
        return _context2.stop();
    }
  }, _callee2);
})));
var enableErrorOverlay = process.env.ERROR_OVERLAY !== 'none';
enableErrorOverlay && ErrorOverlay.startReportingRuntimeErrors({
  onError: function onError() {
    hadRuntimeError = true;
  },
  filename: '/static/js/bundle.js'
});

// @ts-ignore
if (module.hot && typeof module.hot.dispose === 'function') {
  // @ts-ignore
  module.hot.dispose(function () {
    // TODO: why do we need this?
    enableErrorOverlay && ErrorOverlay.stopReportingRuntimeErrors();
  });
}

// There is a newer version of the code available.
function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}
function handleSuccess() {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates(function onHotUpdateSuccess() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise, it would flicker right before the reload.
      tryDismissErrorOverlay();
    });
  }
}
function handleWarnings(warnings) {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;
  var formatted = formatWebpackMessages({
    warnings: warnings,
    errors: []
  });

  // print warnings
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    for (var i = 0; i < formatted.warnings.length; i++) {
      if (i === 5) {
        console.warn('There were more warnings in other files.\n' + 'You can find a complete log in the terminal.');
        break;
      }
      console.warn(stripAnsi(formatted.warnings[i]));
    }
  }

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates(function onSuccessfulHotUpdate() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise, it would flicker right before the reload.
      tryDismissErrorOverlay();
    });
  }
}
function handleErrors(errors) {
  isFirstCompilation = false;
  hasCompileErrors = true;
  var formatted = formatWebpackMessages({
    warnings: [],
    errors: errors
  });

  // Only show the first error.
  enableErrorOverlay && ErrorOverlay.reportBuildError(formatted.errors[0]);

  // Also log them to the console.
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (var i = 0; i < formatted.errors.length; i++) {
      console.error(stripAnsi(formatted.errors[i]));
    }
  }
}
function tryDismissErrorOverlay() {
  if (!hasCompileErrors) {
    enableErrorOverlay && ErrorOverlay.dismissBuildError();
  }
}

// Is there a newer version of this code available?
function isUpdateAvailable() {
  // @ts-ignore
  return mostRecentCompilationHash !== __webpack_hash__;
}
function canApplyUpdates() {
  // @ts-ignore
  return module.hot.status() === 'idle';
}
function canAcceptErrors() {
  // NOTE: This var is injected by Webpack's DefinePlugin, and is a boolean instead of string.
  var hasReactRefresh = process.env.FAST_REFRESH;

  // @ts-ignore
  var status = module.hot.status();
  // React refresh can handle hot-reloading over errors.
  // However, when hot-reload status is abort or fail,
  // it indicates the current update cannot be applied safely,
  // and thus we should bail out to a forced reload for consistency.
  return hasReactRefresh && ['abort', 'fail'].indexOf(status) === -1;
}
function tryApplyUpdates(onHotUpdateSuccess) {
  // @ts-ignore
  if (!module.hot) {
    window.location.reload();
    return;
  }
  if (!isUpdateAvailable() || !canApplyUpdates()) {
    return;
  }
  function handleApplyUpdates(err, updatedModules) {
    var haveErrors = err || hadRuntimeError;
    // When there is no error but updatedModules is unavailable,
    // it indicates a critical failure in hot-reloading,
    // e.g. server is not ready to serve new bundle,
    // and hence we need to do a forced reload.
    var needsForcedReload = !err && !updatedModules;
    if (haveErrors && !canAcceptErrors() || needsForcedReload) {
      window.location.reload();
    }
    if (onHotUpdateSuccess) onHotUpdateSuccess();
    // While we were updating, there was a new update! Do it again.
    if (isUpdateAvailable()) {
      tryApplyUpdates();
    }
  }

  // @ts-ignore
  module.hot.check( /* autoApply */true).then(function (updatedModules) {
    handleApplyUpdates(null, updatedModules);
  }).catch(function (err) {
    handleApplyUpdates(err, null);
  });
}
function handleMessage(_x2) {
  return _handleMessage.apply(this, arguments);
}
function _handleMessage() {
  _handleMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(payload) {
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.t0 = payload.type;
          _context4.next = _context4.t0 === MESSAGE_TYPE.hash ? 3 : _context4.t0 === MESSAGE_TYPE.stillOk ? 5 : _context4.t0 === MESSAGE_TYPE.ok ? 5 : _context4.t0 === MESSAGE_TYPE.errors ? 7 : _context4.t0 === MESSAGE_TYPE.warnings ? 9 : 11;
          break;
        case 3:
          handleAvailableHash(payload.data);
          return _context4.abrupt("break", 11);
        case 5:
          handleSuccess();
          return _context4.abrupt("break", 11);
        case 7:
          handleErrors(payload.data);
          return _context4.abrupt("break", 11);
        case 9:
          handleWarnings(payload.data);
          return _context4.abrupt("break", 11);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _handleMessage.apply(this, arguments);
}