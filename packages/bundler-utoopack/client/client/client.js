const ACTIONS = {
  BUILT: 'built',
  BUILDING: 'building',
  RELOAD: 'reload',
  SYNC: 'sync',
  TURBOPACK_CONNECTED: 'turbopack-connected',
};

console.log('[utoopack] connecting...');

let hasCompileErrors = false;
let shouldReloadOnRecovery = false;
let overlayIframe = null;
let isSocketConnected = false;
let compilingIndicator = null;
let compilingTimer = null;

// Subscribe before the entry wrapper starts any lazy application imports.
// A broken WebSocket must not prevent the application from starting.
let resolveReady;
export const ready = new Promise((resolve) => {
  resolveReady = resolve;
});
// Fall back only if the dev server never confirms the HMR connection.
// A confirmed connection can take longer than a second to send its first sync.
const readyTimer = setTimeout(finishConnecting, 1000);

function finishConnecting() {
  clearTimeout(readyTimer);
  resolveReady();
}

function dismissCompilingIndicator() {
  clearTimeout(compilingTimer);
  compilingTimer = null;
  if (compilingIndicator) {
    compilingIndicator.remove();
    compilingIndicator = null;
  }
}

function showCompilingIndicator() {
  if (compilingTimer !== null || compilingIndicator) return;
  compilingTimer = setTimeout(() => {
    compilingTimer = null;
    compilingIndicator = document.createElement('div');
    compilingIndicator.setAttribute('data-utoopack-compiling', '');
    compilingIndicator.setAttribute('role', 'status');
    compilingIndicator.setAttribute('aria-live', 'polite');
    compilingIndicator.textContent = 'Utoopack is compiling...';
    compilingIndicator.style.cssText = [
      'position: fixed',
      'bottom: 16px',
      'right: 16px',
      'z-index: 2147483646',
      'padding: 10px 14px',
      'border-radius: 6px',
      'background: #18191a',
      'color: #f6f7f8',
      'font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      'box-shadow: 0 2px 8px #0003',
      'pointer-events: none',
    ].join(';');
    (document.body || document.documentElement).appendChild(compilingIndicator);
  }, 150);
}

const enableErrorOverlay =
  typeof process === 'undefined' ||
  !process.env ||
  process.env.ERROR_OVERLAY !== 'none';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dismissBuildError() {
  if (overlayIframe) {
    overlayIframe.remove();
    overlayIframe = null;
  }
}

function reportBuildError(message) {
  dismissBuildError();

  overlayIframe = document.createElement('iframe');
  overlayIframe.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'border: none',
    'z-index: 2147483647',
  ].join(';');
  document.body.appendChild(overlayIframe);

  const doc = overlayIframe.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
html, body { margin: 0; width: 100%; min-height: 100%; background: #18191a; color: #f6f7f8; font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
main { box-sizing: border-box; min-height: 100vh; padding: 32px; }
h1 { margin: 0 0 24px; color: #ff6b6b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 28px; line-height: 1.2; font-weight: 600; }
pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.6; }
button { position: fixed; top: 16px; right: 16px; width: 32px; height: 32px; border: 1px solid #555; border-radius: 4px; background: #242526; color: #f6f7f8; font-size: 22px; line-height: 1; cursor: pointer; }
</style>
</head>
<body>
<button aria-label="Close">&times;</button>
<main>
<h1>Failed to compile</h1>
<pre>${escapeHtml(message)}</pre>
</main>
<script>
document.querySelector('button').addEventListener('click', function () {
  window.parent.postMessage({ type: 'utoopack-dismiss-error-overlay' }, '*');
});
</script>
</body>
</html>`);
  doc.close();
}

function getHost() {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.SOCKET_SERVER
  ) {
    return new URL(process.env.SOCKET_SERVER);
  }
  return location;
}

function getSocketUrl() {
  const host = getHost();
  const isHttps = host.protocol === 'https:';
  return `${isHttps ? 'wss' : 'ws'}://${host.host}/turbopack-hmr`;
}

function getPingUrl() {
  const host = getHost();
  return `${host.protocol}//${host.host}/__umi_ping`;
}

function getErrorMessage(error) {
  if (!error) return 'Unknown utoopack compile error.';
  if (typeof error === 'string') return error;
  return [error.message, error.details, error.stack].filter(Boolean).join('\n');
}

function handleErrors(errors) {
  hasCompileErrors = true;
  shouldReloadOnRecovery = true;

  const messages = errors.map(getErrorMessage).filter(Boolean);
  const firstError = messages[0] || 'Unknown utoopack compile error.';

  if (enableErrorOverlay) {
    reportBuildError(firstError);
  }

  messages.forEach((message) => console.error(message));
}

function handleWarnings(warnings) {
  warnings.map(getErrorMessage).filter(Boolean).forEach((message) => {
    console.warn(message);
  });
}

function handleSuccess() {
  const recoveredFromCompileErrors = hasCompileErrors;
  hasCompileErrors = false;

  if (enableErrorOverlay) {
    dismissBuildError();
  }

  if (recoveredFromCompileErrors && shouldReloadOnRecovery) {
    shouldReloadOnRecovery = false;
    window.location.reload();
  }
}

function handleMessage(payload) {
  switch (payload.action) {
    case ACTIONS.TURBOPACK_CONNECTED:
      isSocketConnected = true;
      clearTimeout(readyTimer);
      break;
    case ACTIONS.BUILDING:
      showCompilingIndicator();
      break;
    case ACTIONS.SYNC:
    case ACTIONS.BUILT:
      dismissCompilingIndicator();
      if (payload.errors && payload.errors.length) {
        handleErrors(payload.errors);
      } else {
        handleSuccess();
      }
      if (payload.warnings && payload.warnings.length) {
        handleWarnings(payload.warnings);
      }
      if (payload.action === ACTIONS.SYNC) finishConnecting();
      break;
    case ACTIONS.RELOAD:
      dismissCompilingIndicator();
      window.location.reload();
      break;
    default:
      break;
  }
}

async function waitForSuccessfulPing(ms = 1000) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fetch(getPingUrl());
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
}

const socket = new WebSocket(getSocketUrl());

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'utoopack-dismiss-error-overlay') {
    dismissBuildError();
  }
});

socket.addEventListener('message', ({ data }) => {
  try {
    handleMessage(JSON.parse(data));
  } catch (e) {
    console.error(e);
  }
});

socket.addEventListener('close', async () => {
  dismissCompilingIndicator();
  finishConnecting();
  if (!isSocketConnected) {
    console.info('[utoopack] Dev server connection failed.');
    return;
  }

  console.info('[utoopack] Dev server disconnected. Polling for restart...');
  await waitForSuccessfulPing();
  window.location.reload();
});

socket.addEventListener('error', () => {
  dismissCompilingIndicator();
  finishConnecting();
});
