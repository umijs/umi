// import { Terminal } from 'xterm';
import { IUi } from 'umi-types';
// import * as fit from 'xterm/dist/addons/fit/fit';
// import * as webLinks from 'xterm/dist/addons/webLinks/webLinks';
// import 'xterm/dist/xterm.css';

// Terminal.applyAddon(fit);
// Terminal.applyAddon(webLinks);

const defaultTheme = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff',
};

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030',
};
// const xterm = new Terminal({
//   theme: darkTheme,
//   rows: 10,
// });
// window.xterm = xterm;

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
        el.style.position = 'absolute';
        el.style.left = 0;
        el.style.top = 0;
        el.style.width = '100%';
        el.style.background = '#f04134';
        el.style.zIndex = 2147483647000000;
        el.style.color = '#ffffff';
        el.style.textAlign = 'center';
        el.style.fontSize = '18px';
        el.style.fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`;
        el.style.padding = '8px 0';
        el.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
        el.innerHTML =
          window.g_lang === 'zh-CN'
            ? '已和 umi ui 服务器断开连接，正在尝试重连...'
            : 'Disconnected from the umi ui server, trying to reconnect...';
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
    messageHandlers.push(({ type, payload }) => {
      if (type === `${action.type}/success`) {
        resolve(payload);
      }
      if (type === `${action.type}/failure`) {
        reject(payload);
      }
      if (type === `${action.type}/progress` && action.onProgress) {
        action.onProgress(payload);
      }
    });
    sock.send(JSON.stringify(action));
  });
}

export function listenRemote(action) {
  messageHandlers.push(({ type, payload }) => {
    if (type === action.type) {
      action.onMessage(payload);
    }
  });
}
