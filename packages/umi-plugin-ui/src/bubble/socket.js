import SockJS from 'sockjs-client';

let sock = null;
const messageHandlers = [];

export async function init(url, opts = {}) {
  const { onMessage, onError } = opts;
  return new Promise((resolve, reject) => {
    function handler(e) {
      const { type, payload } = JSON.parse(e.data);
      if (onMessage) {
        onMessage({ type, payload });
      }
      messageHandlers.forEach(h => {
        h({ type, payload });
      });
    }

    sock = new SockJS(url);
    sock.onopen = () => {
      resolve();
    };
    sock.onmessage = handler;
    sock.onclose = e => {
      console.error('ui socket init', e);
      sock = null;
      onError(e);
    };
  });
}

export function callRemote(action) {
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
      }),
    );
  });
}
