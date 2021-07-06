/* global __react_refresh_error_overlay__, __react_refresh_socket__, __resourceQuery */

import { handleError, handleUnhandledRejection } from './utils/errorEventHandlers.js';
import formatWebpackErrors from './utils/formatWebpackErrors.js';
import runWithPatchedUrl from './utils/patchUrl.js';

// Setup error states
let isHotReload = false;
let hasRuntimeErrors = false;

/**
 * Try dismissing the compile error overlay.
 * This will also reset runtime error records (if any),
 * because we have new source to evaluate.
 * @returns {void}
 */
function tryDismissErrorOverlay() {
  __react_refresh_error_overlay__.clearCompileError();
  __react_refresh_error_overlay__.clearRuntimeErrors(!hasRuntimeErrors);
  hasRuntimeErrors = false;
}

/**
 * A function called after a compile success signal is received from Webpack.
 * @returns {void}
 */
function handleCompileSuccess() {
  isHotReload = true;

  if (isHotReload) {
    tryDismissErrorOverlay();
  }
}

/**
 * A function called after a compile errored signal is received from Webpack.
 * @param {string[]} errors
 * @returns {void}
 */
function handleCompileErrors(errors) {
  isHotReload = true;

  const formattedErrors = formatWebpackErrors(errors);

  // Only show the first error
  __react_refresh_error_overlay__.showCompileError(formattedErrors[0]);
}

/**
 * Handles compilation messages from Webpack.
 * Integrates with a compile error overlay.
 * @param {*} message A Webpack HMR message sent via WebSockets.
 * @returns {void}
 */
function compileMessageHandler(message) {
  switch (message.type) {
    case 'ok':
    case 'still-ok':
    case 'warnings': {
      // TODO: Implement handling for warnings
      handleCompileSuccess();
      break;
    }
    case 'errors': {
      handleCompileErrors(message.data);
      break;
    }
    default: {
      // Do nothing.
    }
  }
}

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  runWithPatchedUrl(function setupOverlay() {
    // Only register if no other overlay have been registered
    if (!window.__reactRefreshOverlayInjected && __react_refresh_socket__) {
      // Registers handlers for compile errors
      __react_refresh_socket__.init(compileMessageHandler, __resourceQuery);
      // Registers handlers for runtime errors
      handleError(function handleError(error) {
        hasRuntimeErrors = true;
        __react_refresh_error_overlay__.handleRuntimeError(error);
      });
      handleUnhandledRejection(function handleUnhandledPromiseRejection(error) {
        hasRuntimeErrors = true;
        __react_refresh_error_overlay__.handleRuntimeError(error);
      });

      // Mark overlay as injected to prevent double-injection
      window.__reactRefreshOverlayInjected = true;
    }
  });
}
