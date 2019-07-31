import { Terminal } from 'xterm';
import * as fit from 'xterm/dist/addons/fit/fit';
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks';
import 'xterm/dist/xterm.css';

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);

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
const xterm = new Terminal({
  theme: darkTheme,
  rows: 10,
});
window.xterm = xterm;

let sock;
const messageHandlers = [];

export async function init(opts = {}) {
  const { onMessage } = opts;
  return new Promise(resolve => {
    sock = new window.SockJS('/umiui');
    sock.onopen = () => {
      xterm.writeln('\x1b[32mSOCKET READY\x1b[0m');
      resolve();
    };
    sock.onmessage = e => {
      const { type, payload } = JSON.parse(e.data);
      onMessage({ type, payload });
      messageHandlers.forEach(h => {
        h({ type, payload });
      });
    };
    sock.onclose = () => {
      xterm.writeln('\x1b[31mSOCKET CLOSED\x1b[0m');
    };
  });
}

export function send(action) {
  if (!sock) {
    throw new Error('sock not ready');
  }
  sock.send(JSON.stringify(action));
}

export function callRemote(action) {
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
