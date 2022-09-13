function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import stripAnsi from '@umijs/utils/compiled/strip-ansi'; // @ts-ignore

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
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            data = _ref.data;
            data = JSON.parse(data);

            if (data.type === 'connected') {
              console.log("[webpack] connected."); // proxy(nginx, docker) hmr ws maybe caused timeout,
              // so send ping package let ws keep alive.

              pingTimer = setInterval(function () {
                return socket.send('ping');
              }, 30000);
            } else {
              handleMessage(data).catch(console.error);
            }

          case 3:
          case "end":
            return _context.stop();
        }
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
  _waitForSuccessfulPing = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var ms,
        _args3 = arguments;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
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
      }
    }, _callee3, null, [[2, 8]]);
  }));
  return _waitForSuccessfulPing.apply(this, arguments);
}

socket.addEventListener('close', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
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
    }
  }, _callee2);
})));
ErrorOverlay.startReportingRuntimeErrors({
  onError: function onError() {
    hadRuntimeError = true;
  },
  filename: '/static/js/bundle.js'
}); // @ts-ignore

if (module.hot && typeof module.hot.dispose === 'function') {
  // @ts-ignore
  module.hot.dispose(function () {
    // TODO: why do we need this?
    ErrorOverlay.stopReportingRuntimeErrors();
  });
} // There is a newer version of the code available.


function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}

function handleSuccess() {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false; // Attempt to apply hot updates or reload.

  if (isHotUpdate) {
    tryApplyUpdates(function onHotUpdateSuccess() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
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
  }); // print warnings

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    for (var i = 0; i < formatted.warnings.length; i++) {
      if (i === 5) {
        console.warn('There were more warnings in other files.\n' + 'You can find a complete log in the terminal.');
        break;
      }

      console.warn(stripAnsi(formatted.warnings[i]));
    }
  } // Attempt to apply hot updates or reload.


  if (isHotUpdate) {
    tryApplyUpdates(function onSuccessfulHotUpdate() {
      // Only dismiss it when we're sure it's a hot update.
      // Otherwise it would flicker right before the reload.
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
  }); // Only show the first error.

  ErrorOverlay.reportBuildError(formatted.errors[0]); // Also log them to the console.

  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (var i = 0; i < formatted.errors.length; i++) {
      console.error(stripAnsi(formatted.errors[i]));
    }
  }
}

function tryDismissErrorOverlay() {
  if (!hasCompileErrors) {
    ErrorOverlay.dismissBuildError();
  }
} // Is there a newer version of this code available?


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
  var hasReactRefresh = process.env.FAST_REFRESH; // @ts-ignore

  var status = module.hot.status(); // React refresh can handle hot-reloading over errors.
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
    var haveErrors = err || hadRuntimeError; // When there is no error but updatedModules is unavailable,
    // it indicates a critical failure in hot-reloading,
    // e.g. server is not ready to serve new bundle,
    // and hence we need to do a forced reload.

    var needsForcedReload = !err && !updatedModules;

    if (haveErrors && !canAcceptErrors() || needsForcedReload) {
      window.location.reload();
    }

    if (onHotUpdateSuccess) onHotUpdateSuccess(); // While we were updating, there was a new update! Do it again.

    if (isUpdateAvailable()) {
      tryApplyUpdates();
    }
  } // @ts-ignore


  module.hot.check(
  /* autoApply */
  true).then(function (updatedModules) {
    handleApplyUpdates(null, updatedModules);
  }).catch(function (err) {
    handleApplyUpdates(err, null);
  });
}

function handleMessage(_x2) {
  return _handleMessage.apply(this, arguments);
}

function _handleMessage() {
  _handleMessage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(payload) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
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
      }
    }, _callee4);
  }));
  return _handleMessage.apply(this, arguments);
}