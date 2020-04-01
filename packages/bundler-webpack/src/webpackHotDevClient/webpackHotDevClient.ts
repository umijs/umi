import SockJS from 'sockjs-client';
import url from 'url';
import {
  handleErrors,
  handleHashChange,
  handleSuccess,
  handleWarnings,
  showPending,
} from './handlers';

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
        handleSuccess();
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

initSocket();
