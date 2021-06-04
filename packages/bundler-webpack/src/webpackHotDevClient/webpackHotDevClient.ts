// @ts-ignore
import * as ErrorOverlay from 'react-error-overlay';
import SockJS from 'sockjs-client';
import stripAnsi from 'strip-ansi';
import url from 'url';
import formatWebpackMessages from './formatWebpackMessages';

let hadRuntimeError = false;
ErrorOverlay.startReportingRuntimeErrors({
  onError: function () {
    hadRuntimeError = true;
  },
});

let isFirstCompilation = true;
let mostRecentCompilationHash: string | null = null;
let hasCompileErrors = false;

function handleHashChange(hash: string) {
  mostRecentCompilationHash = hash;
}

function handleSuccess(data?: { reload: boolean }) {
  if (data && data.reload) {
    window.location.reload();
    return;
  }
  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  if (isHotUpdate) {
    tryApplyUpdates(() => {
      ErrorOverlay.dismissBuildError();
    });
  }
}

function handleWarnings(warnings: any) {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  function printWarnings() {
    const formatted = formatWebpackMessages({
      warnings,
      errors: [],
    });
    formatted.warnings.forEach((warning: string) => {
      console.warn(stripAnsi(warning));
    });
  }

  if (isHotUpdate) {
    tryApplyUpdates(() => {
      printWarnings();
      ErrorOverlay.dismissBuildError();
    });
  } else {
    printWarnings();
  }
}

function handleErrors(errors: any) {
  isFirstCompilation = false;
  hasCompileErrors = true;

  const formatted = formatWebpackMessages({
    errors,
    warnings: [],
  });

  ErrorOverlay.reportBuildError(formatted.errors[0]);

  formatted.errors.forEach((error: string) => {
    console.error(stripAnsi(error));
  });
}

let tryApplyUpdates: any = null;

// function tryApplyUpdates(onHotUpdateSuccess?: Function) {
//   // @ts-ignore
//   if (!module.hot) {
//     window.location.reload();
//     return;
//   }
//
//   function isUpdateAvailable() {
//     // @ts-ignore
//     return mostRecentCompilationHash !== __webpack_hash__;
//   }
//
//   // TODO: is update available?
//   // @ts-ignore
//   if (!isUpdateAvailable() || module.hot.status() !== 'idle') {
//     return;
//   }
//
//   function handleApplyUpdates(err: Error | null, updatedModules: any) {
//     if (err || !updatedModules || hadRuntimeError) {
//       window.location.reload();
//       return;
//     }
//
//     onHotUpdateSuccess?.();
//
//     if (isUpdateAvailable()) {
//       // While we were updating, there was a new update! Do it again.
//       tryApplyUpdates();
//     }
//   }
//
//   // @ts-ignore
//   module.hot.check(true).then(
//     function (updatedModules: any) {
//       handleApplyUpdates(null, updatedModules);
//     },
//     function (err: Error) {
//       handleApplyUpdates(err, null);
//     },
//   );
// }

const showPending = (): HTMLDivElement => {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = '0px';
  el.style.top = '0px';
  el.style.width = '100%';
  el.style.background = '#fff1b8';
  el.style.zIndex = '2147483647000000';
  el.style.color = '#613400';
  el.style.textAlign = 'center';
  el.style.fontSize = '18px';
  el.style.fontFamily = 'Consolas, Menlo, Courier, monospace';
  el.style.padding = '8px 0';
  el.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
  el.innerHTML = 'Disconnected from the devServer, trying to reconnect...';
  document.body.appendChild(el);
  return el;
};

let sock: InstanceType<typeof SockJS>;
let retries: number = 0;
let pending: HTMLDivElement | undefined;

function stripLastSlash(url: string) {
  if (url.slice(-1) === '/') {
    return url.slice(0, -1);
  } else {
    return url;
  }
}

function getSocketHost() {
  if (process.env.SOCKET_SERVER) {
    return stripLastSlash(process.env.SOCKET_SERVER);
  }

  let host, protocol;
  const scripts = document.body?.querySelectorAll?.('script') || [];
  const dataFromSrc = scripts[scripts.length - 1]
    ? scripts[scripts.length - 1].getAttribute('src')
    : '';
  if (dataFromSrc && dataFromSrc.includes('umi.js')) {
    const urlParsed = url.parse(dataFromSrc);
    host = urlParsed.host;
    protocol = urlParsed.protocol;
  } else {
    // 某些场景可能没有 umi.js，比如微前端的场景
    host = location.host;
    protocol = location.protocol;
  }

  return host && protocol ? url.format({ host, protocol }) : '';
}

function initSocket() {
  const host = getSocketHost();
  sock = new SockJS(`${host}/dev-server`);

  sock.onopen = () => {
    retries = 0;
    pending?.parentElement?.removeChild(pending);
  };

  sock.onmessage = (e) => {
    const message = JSON.parse(e.data);
    switch (message.type) {
      case 'hash':
        handleHashChange(message.data);
        break;
      case 'still-ok':
      case 'ok':
        handleSuccess(message.data);
        break;
      case 'warnings':
        handleWarnings(message.data);
        break;
      case 'errors':
        handleErrors(message.data);
        break;
      default:
        break;
    }
  };
  sock.onclose = (e) => {
    if (retries === 0) {
      if (typeof console?.info === 'function') {
        console.info(
          'The development server has disconnected.\nRefresh the page if necessary.',
        );
      }
    }

    // @ts-ignore
    sock = null;
    if (!pending) {
      pending = showPending();
    }

    if (retries <= 10) {
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;

      setTimeout(() => {
        initSocket();
      }, retryInMs);
    }
  };
}

// TODO: improve this
// @ts-ignore
window.g_initWebpackHotDevClient = function (opts: {
  tryApplyUpdates: Function;
}) {
  tryApplyUpdates = opts.tryApplyUpdates;
  initSocket();
};
// @ts-ignore
window.g_getMostRecentCompilationHash = () => {
  return mostRecentCompilationHash;
};
// @ts-ignore
window.g_getHadRuntimeError = () => {
  return hadRuntimeError;
};
