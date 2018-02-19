const SockJS = require('sockjs-client');
const { connectServer, showLoading } = require('./patchConnection');

let retries = 0;
let sock = null;

const socket = function initSocket(url, handlers) {
  sock = new SockJS(url);

  sock.onopen = function onopen() {
    retries = 0;
  };

  sock.onmessage = handlers.onmessage;

  sock.onclose = function onclose() {
    if (retries === 0) {
      handlers.onclose();
    }

    // Try to reconnect.
    sock = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries < 1) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-mixed-operators, no-restricted-properties
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;

      setTimeout(() => {
        socket(url, handlers);
      }, retryInMs);
    } else {
      showLoading();
      connectServer(() => {
        window.location.reload();
      });
    }
  };
};

module.exports = socket;
