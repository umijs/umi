import stripAnsi from '@umijs/utils/compiled/strip-ansi';
// @ts-ignore
import * as ErrorOverlay from 'react-error-overlay';
import { MESSAGE_TYPE } from '../constants';
import { formatWebpackMessages } from '../utils/formatWebpackMessages';

console.log('[webpack] connecting...');

function getHost(): { protocol: string; host: string; port: string } {
  if (process.env.SOCKET_SERVER) {
    return new URL(process.env.SOCKET_SERVER);
  }
  return location;
}

function getSocketUrl() {
  let h = getHost();
  const host = h.host;
  const isHttps = h.protocol === 'https:';
  return `${isHttps ? 'wss' : 'ws'}://${host}`;
}

function getPingUrl() {
  const h = getHost();
  return `${h.protocol}//${h.host}/__umi_ping`;
}

let pingTimer: number | null = null;

let isFirstCompilation = true;
let mostRecentCompilationHash: string | null = null;
let hasCompileErrors = false;
let hadRuntimeError = false;
const pingUrl = getPingUrl();

const socket = new WebSocket(getSocketUrl(), 'webpack-hmr');

socket.addEventListener('message', async ({ data }) => {
  data = JSON.parse(data);
  if (data.type === 'connected') {
    console.log(`[webpack] connected.`);
    // proxy(nginx, docker) hmr ws maybe caused timeout,
    // so send ping package let ws keep alive.
    pingTimer = window.setInterval(() => socket.send('ping'), 30000);
  } else {
    handleMessage(data).catch(console.error);
  }
});

async function waitForSuccessfulPing(ms = 1000) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fetch(pingUrl);
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
}

socket.addEventListener('close', async () => {
  if (pingTimer) clearInterval(pingTimer);
  console.info('[webpack] Dev server disconnected. Polling for restart...');
  await waitForSuccessfulPing();
  location.reload();
});

const enableErrorOverlay = process.env.ERROR_OVERLAY !== 'none';
enableErrorOverlay &&
  ErrorOverlay.startReportingRuntimeErrors({
    onError: function () {
      hadRuntimeError = true;
    },
    filename: '/static/js/bundle.js',
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
function handleAvailableHash(hash: string) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}

function handleSuccess() {
  const isHotUpdate = !isFirstCompilation;
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

function handleWarnings(warnings: string[]) {
  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  const formatted = formatWebpackMessages({
    warnings,
    errors: [],
  });

  // print warnings
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    for (let i = 0; i < formatted.warnings.length; i++) {
      if (i === 5) {
        console.warn(
          'There were more warnings in other files.\n' +
            'You can find a complete log in the terminal.',
        );
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

function handleErrors(errors: string[]) {
  isFirstCompilation = false;
  hasCompileErrors = true;

  const formatted = formatWebpackMessages({
    warnings: [],
    errors,
  });

  // Only show the first error.
  enableErrorOverlay && ErrorOverlay.reportBuildError(formatted.errors[0]);

  // Also log them to the console.
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (let i = 0; i < formatted.errors.length; i++) {
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
  const hasReactRefresh = process.env.FAST_REFRESH;

  // @ts-ignore
  const status = module.hot.status();
  // React refresh can handle hot-reloading over errors.
  // However, when hot-reload status is abort or fail,
  // it indicates the current update cannot be applied safely,
  // and thus we should bail out to a forced reload for consistency.
  return hasReactRefresh && ['abort', 'fail'].indexOf(status) === -1;
}

function tryApplyUpdates(onHotUpdateSuccess?: Function) {
  // @ts-ignore
  if (!module.hot) {
    window.location.reload();
    return;
  }
  if (!isUpdateAvailable() || !canApplyUpdates()) {
    return;
  }

  function handleApplyUpdates(err: Error | null, updatedModules: any) {
    const haveErrors = err || hadRuntimeError;
    // When there is no error but updatedModules is unavailable,
    // it indicates a critical failure in hot-reloading,
    // e.g. server is not ready to serve new bundle,
    // and hence we need to do a forced reload.
    const needsForcedReload = !err && !updatedModules;
    if ((haveErrors && !canAcceptErrors()) || needsForcedReload) {
      window.location.reload();
    }
    if (onHotUpdateSuccess) onHotUpdateSuccess();
    // While we were updating, there was a new update! Do it again.
    if (isUpdateAvailable()) {
      tryApplyUpdates();
    }
  }

  // @ts-ignore
  module.hot
    .check(/* autoApply */ true)
    .then((updatedModules: any) => {
      handleApplyUpdates(null, updatedModules);
    })
    .catch((err: Error) => {
      handleApplyUpdates(err, null);
    });
}

async function handleMessage(payload: any) {
  // console.log('[payload]', payload);
  switch (payload.type) {
    case MESSAGE_TYPE.hash:
      handleAvailableHash(payload.data);
      break;
    case MESSAGE_TYPE.stillOk:
    case MESSAGE_TYPE.ok:
      handleSuccess();
      break;
    case MESSAGE_TYPE.errors:
      handleErrors(payload.data);
      break;
    case MESSAGE_TYPE.warnings:
      handleWarnings(payload.data);
      break;
    default:
    // Do nothing
  }
}
