let sock;
const messageHandlers = [];

export async function init(opts = {}) {
  const { onMessage } = opts;
  return new Promise(resolve => {
    sock = new window.SockJS('/umiui');
    sock.onopen = () => {
      console.log('SOCKET READY');
      resolve();
    };
    sock.onmessage = e => {
      // console.log('[RECEIVED FROM SERVER]', e.data);
      const { type, payload } = JSON.parse(e.data);
      onMessage({ type, payload });
      messageHandlers.forEach(h => {
        h({ type, payload });
      });
    };
    sock.onclose = () => {
      console.log('close');
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
    });
    sock.send(JSON.stringify(action));
  });
}

window.send = send;
window.callRemote = callRemote;
