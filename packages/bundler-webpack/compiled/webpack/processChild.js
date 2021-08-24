/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 763:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PARENT_MESSAGE_CUSTOM =
  exports.PARENT_MESSAGE_SETUP_ERROR =
  exports.PARENT_MESSAGE_CLIENT_ERROR =
  exports.PARENT_MESSAGE_OK =
  exports.CHILD_MESSAGE_END =
  exports.CHILD_MESSAGE_CALL =
  exports.CHILD_MESSAGE_INITIALIZE =
    void 0;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import type {ResourceLimits} from 'worker_threads';
// This is not present in the Node 12 typings
// Because of the dynamic nature of a worker communication process, all messages
// coming from any of the other processes cannot be typed. Thus, many types
// include "unknown" as a TS type, which is (unfortunately) correct here.
const CHILD_MESSAGE_INITIALIZE = 0;
exports.CHILD_MESSAGE_INITIALIZE = CHILD_MESSAGE_INITIALIZE;
const CHILD_MESSAGE_CALL = 1;
exports.CHILD_MESSAGE_CALL = CHILD_MESSAGE_CALL;
const CHILD_MESSAGE_END = 2;
exports.CHILD_MESSAGE_END = CHILD_MESSAGE_END;
const PARENT_MESSAGE_OK = 0;
exports.PARENT_MESSAGE_OK = PARENT_MESSAGE_OK;
const PARENT_MESSAGE_CLIENT_ERROR = 1;
exports.PARENT_MESSAGE_CLIENT_ERROR = PARENT_MESSAGE_CLIENT_ERROR;
const PARENT_MESSAGE_SETUP_ERROR = 2;
exports.PARENT_MESSAGE_SETUP_ERROR = PARENT_MESSAGE_SETUP_ERROR;
const PARENT_MESSAGE_CUSTOM = 3;
exports.PARENT_MESSAGE_CUSTOM = PARENT_MESSAGE_CUSTOM;


/***/ }),

/***/ 87:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 87;
module.exports = webpackEmptyContext;

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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";


function _types() {
  const data = __nccwpck_require__(763);

  _types = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
let file = null;
let setupArgs = [];
let initialized = false;
/**
 * This file is a small bootstrapper for workers. It sets up the communication
 * between the worker and the parent process, interpreting parent messages and
 * sending results back.
 *
 * The file loaded will be lazily initialized the first time any of the workers
 * is called. This is done for optimal performance: if the farm is initialized,
 * but no call is made to it, child Node processes will be consuming the least
 * possible amount of memory.
 *
 * If an invalid message is detected, the child will exit (by throwing) with a
 * non-zero exit code.
 */

const messageListener = request => {
  switch (request[0]) {
    case _types().CHILD_MESSAGE_INITIALIZE:
      const init = request;
      file = init[2];
      setupArgs = request[3];
      break;

    case _types().CHILD_MESSAGE_CALL:
      const call = request;
      execMethod(call[2], call[3]);
      break;

    case _types().CHILD_MESSAGE_END:
      end();
      break;

    default:
      throw new TypeError(
        'Unexpected request from parent process: ' + request[0]
      );
  }
};

process.on('message', messageListener);

function reportSuccess(result) {
  if (!process || !process.send) {
    throw new Error('Child can only be used on a forked process');
  }

  process.send([_types().PARENT_MESSAGE_OK, result]);
}

function reportClientError(error) {
  return reportError(error, _types().PARENT_MESSAGE_CLIENT_ERROR);
}

function reportInitializeError(error) {
  return reportError(error, _types().PARENT_MESSAGE_SETUP_ERROR);
}

function reportError(error, type) {
  if (!process || !process.send) {
    throw new Error('Child can only be used on a forked process');
  }

  if (error == null) {
    error = new Error('"null" or "undefined" thrown');
  }

  process.send([
    type,
    error.constructor && error.constructor.name,
    error.message,
    error.stack,
    typeof error === 'object' ? {...error} : error
  ]);
}

function end() {
  const main = __nccwpck_require__(87)(file);

  if (!main.teardown) {
    exitProcess();
    return;
  }

  execFunction(main.teardown, main, [], exitProcess, exitProcess);
}

function exitProcess() {
  // Clean up open handles so the process ideally exits gracefully
  process.removeListener('message', messageListener);
}

function execMethod(method, args) {
  const main = __nccwpck_require__(87)(file);

  let fn;

  if (method === 'default') {
    fn = main.__esModule ? main['default'] : main;
  } else {
    fn = main[method];
  }

  function execHelper() {
    execFunction(fn, main, args, reportSuccess, reportClientError);
  }

  if (initialized || !main.setup) {
    execHelper();
    return;
  }

  initialized = true;
  execFunction(main.setup, main, setupArgs, execHelper, reportInitializeError);
}

const isPromise = obj =>
  !!obj &&
  (typeof obj === 'object' || typeof obj === 'function') &&
  typeof obj.then === 'function';

function execFunction(fn, ctx, args, onResult, onError) {
  let result;

  try {
    result = fn.apply(ctx, args);
  } catch (err) {
    onError(err);
    return;
  }

  if (isPromise(result)) {
    result.then(onResult, onError);
  } else {
    onResult(result);
  }
}

})();

module.exports = __webpack_exports__;
/******/ })()
;