import { IUi } from 'umi-types';
import { getLocale } from 'umi-plugin-react/locale';

let sock;
let retries = 0;
let el;
const messageHandlers = [];

export async function init(opts = {}) {
  const { onMessage } = opts;
  return new Promise(resolve => {
    function handler(e) {
      const { type, payload } = JSON.parse(e.data);
      onMessage({ type, payload });
      messageHandlers.forEach(h => {
        h({ type, payload });
      });
    }

    function hideErrorMessage() {
      if (el) {
        el.style.display = 'none';
      }
    }

    function showErrorMessage() {
      if (!el) {
        el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.left = 0;
        el.style.top = 0;
        el.style.width = '100%';
        el.style.background = '#f04134';
        el.style.zIndex = 2147483647000000;
        el.style.color = '#ffffff';
        el.style.textAlign = 'center';
        el.style.fontSize = '16px';
        el.style.fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`;
        el.style.padding = '8px 0';
        el.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
        el.innerHTML =
          window.g_lang === 'zh-CN'
            ? '已和 Umi UI 服务器断开连接，正在尝试重连...'
            : 'Disconnected from the Umi UI server, trying to reconnect...';
        document.body.appendChild(el);
      } else {
        el.style.display = 'block';
      }
    }

    function initSocket() {
      sock = new window.SockJS('/umiui');
      sock.onopen = () => {
        retries = 0;
        hideErrorMessage();
        resolve();
      };
      sock.onmessage = handler;
      sock.onclose = () => {
        sock = null;
        if (retries === 0) showErrorMessage();
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
  });
}

export function send(action) {
  if (!sock) {
    throw new Error('sock not ready');
  }
  sock.send(JSON.stringify(action));
}

export function callRemote<T = object, K = object>(
  action: IUi.IAction<T, K>,
): Promise<{ data: K }> {
  return new Promise((resolve, reject) => {
    function handler({ type, payload }) {
      if (type === `${action.type}/success`) {
        if (!action.keep) removeHandler();
        resolve(payload);
      }
      if (type === `${action.type}/failure`) {
        if (!action.keep) removeHandler();
        reject(payload);
      }
      if (type === `${action.type}/progress` && action.onProgress) {
        action.onProgress(payload);
      }
    }
    function removeHandler() {
      for (const [i, h] of messageHandlers.entries()) {
        if (h === handler) {
          messageHandlers.splice(i, 1);
          break;
        }
      }
    }
    messageHandlers.push(handler);
    sock.send(
      JSON.stringify({
        ...action,
        $lang: getLocale(),
        $key: window.g_currentProject ? window.g_currentProject.key : '',
      }),
    );
  });
}

export function listenRemote(action) {
  function handler({ type, payload }) {
    if (type === action.type) {
      action.onMessage(payload);
    }
  }
  messageHandlers.push(handler);
  return () => {
    for (const [i, h] of messageHandlers.entries()) {
      if (h === handler) {
        messageHandlers.splice(i, 1);
        break;
      }
    }
  };
}
