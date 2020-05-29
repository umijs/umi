/* global __react_refresh_error_overlay__, __react_refresh_test__ */
const Refresh = require('react-refresh/runtime');

/**
 * Extracts exports from a webpack module object.
 * @param {*} module A Webpack module object.
 * @returns {*} An exports object from the module.
 */
function getModuleExports(module) {
  return module.exports || module.__proto__.exports;
}

/**
 * Calculates the signature of a React refresh boundary.
 * If this signature changes, it's unsafe to accept the boundary.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L795-L816).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {string[]} A React refresh boundary signature array.
 */
function getReactRefreshBoundarySignature(moduleExports) {
  const signature = [];
  signature.push(Refresh.getFamilyByType(moduleExports));

  if (moduleExports == null || typeof moduleExports !== 'object') {
    // Exit if we can't iterate over exports.
    return signature;
  }

  for (let key in moduleExports) {
    if (key === '__esModule') {
      continue;
    }

    signature.push(key);
    signature.push(Refresh.getFamilyByType(moduleExports[key]));
  }

  return signature;
}

/**
 * Creates conditional full refresh dispose handler for Webpack hot.
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {hotDisposeCallback} A webpack hot dispose callback.
 */
function createHotDisposeCallback(moduleExports) {
  /**
   * A callback to performs a full refresh if React has unrecoverable errors,
   * and also caches the to-be-disposed module.
   * @param {*} data A hot module data object from Webpack HMR.
   * @returns {void}
   */
  function hotDisposeCallback(data) {
    // We have to mutate the data object to get data registered and cached
    data.prevExports = moduleExports;
  }

  return hotDisposeCallback;
}

/**
 * Creates self-recovering an error handler for webpack hot.
 * @param {string} moduleId A Webpack module ID.
 * @returns {selfAcceptingHotErrorHandler} A self-accepting webpack hot error handler.
 */
function createHotErrorHandler(moduleId) {
  /**
   * An error handler to show a module evaluation error with an error overlay.
   * @param {Error} error An error occurred during evaluation of a module.
   * @returns {void}
   */
  function hotErrorHandler(error) {
    // if (__react_refresh_error_overlay__) {
    //   __react_refresh_error_overlay__.handleRuntimeError(error);
    // }

    if (typeof __react_refresh_test__ !== 'undefined') {
      if (window.onHotAcceptError) {
        window.onHotAcceptError(error.message);
      }
    }
  }

  /**
   * An error handler to allow self-recovering behaviours.
   * @param {Error} error An error occurred during evaluation of a module.
   * @returns {void}
   */
  function selfAcceptingHotErrorHandler(error) {
    hotErrorHandler(error);
    require.cache[moduleId].hot.accept(hotErrorHandler);
  }

  return selfAcceptingHotErrorHandler;
}

/**
 * Creates a helper that performs a delayed React refresh.
 * @returns {enqueueUpdate} A debounced React refresh function.
 */
function createDebounceUpdate() {
  /**
   * A cached setTimeout handler.
   * @type {number | void}
   */
  let refreshTimeout = undefined;

  /**
   * Performs react refresh on a delay and clears the error overlay.
   * @returns {void}
   */
  function enqueueUpdate() {
    if (refreshTimeout === undefined) {
      refreshTimeout = setTimeout(function () {
        refreshTimeout = undefined;
        Refresh.performReactRefresh();
        // if (__react_refresh_error_overlay__) {
        //   __react_refresh_error_overlay__.clearRuntimeErrors();
        // }
      }, 30);
    }
  }

  return enqueueUpdate;
}

/**
 * Checks if all exports are likely a React component.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L748-L774).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {boolean} Whether the exports are React component like.
 */
function isReactRefreshBoundary(moduleExports) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    return true;
  }
  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== 'object'
  ) {
    // Exit if we can't iterate over exports.
    return false;
  }

  let hasExports = false;
  let areAllExportsComponents = true;
  for (let key in moduleExports) {
    hasExports = true;

    // This is the ES Module indicator flag set by Webpack
    if (key === '__esModule') {
      continue;
    }

    // We can (and have to) safely execute getters here,
    // as Webpack manually assigns harmony exports to getters,
    // without any side-effects attached.
    // Ref: https://github.com/webpack/webpack/blob/b93048643fe74de2a6931755911da1212df55897/lib/MainTemplate.js#L281
    const exportValue = moduleExports[key];
    if (!Refresh.isLikelyComponentType(exportValue)) {
      areAllExportsComponents = false;
    }
  }

  return hasExports && areAllExportsComponents;
}

/**
 * Checks if exports are likely a React component and registers them.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L818-L835).
 * @param {*} moduleExports A Webpack module exports object.
 * @param {string} moduleId A Webpack module ID.
 * @returns {void}
 */
function registerExportsForReactRefresh(moduleExports, moduleId) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    // Register module.exports if it is likely a component
    Refresh.register(moduleExports, moduleId + ' %exports%');
  }

  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== 'object'
  ) {
    // Exit if we can't iterate over the exports.
    return;
  }

  for (let key in moduleExports) {
    // Skip registering the Webpack ES Module indicator
    if (key === '__esModule') {
      continue;
    }

    const exportValue = moduleExports[key];
    if (Refresh.isLikelyComponentType(exportValue)) {
      const typeID = moduleId + ' %exports% ' + key;
      Refresh.register(exportValue, typeID);
    }
  }
}

/**
 * Compares previous and next module objects to check for mutated boundaries.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L776-L792).
 * @param prevExports {*} The current Webpack module exports object.
 * @param nextExports {*} The next Webpack module exports object.
 * @returns {boolean} Whether the React refresh boundary should be invalidated.
 */
function shouldInvalidateReactRefreshBoundary(prevExports, nextExports) {
  const prevSignature = getReactRefreshBoundarySignature(prevExports);
  const nextSignature = getReactRefreshBoundarySignature(nextExports);

  if (prevSignature.length !== nextSignature.length) {
    return true;
  }

  for (let i = 0; i < nextSignature.length; i += 1) {
    if (prevSignature[i] !== nextSignature[i]) {
      return true;
    }
  }

  return false;
}

module.exports = Object.freeze({
  createHotDisposeCallback: createHotDisposeCallback,
  createHotErrorHandler: createHotErrorHandler,
  enqueueUpdate: createDebounceUpdate(),
  getModuleExports,
  isReactRefreshBoundary: isReactRefreshBoundary,
  shouldInvalidateReactRefreshBoundary: shouldInvalidateReactRefreshBoundary,
  registerExportsForReactRefresh: registerExportsForReactRefresh,
});
