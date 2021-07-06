import * as SockJS from 'sockjs-client/dist/sockjs.js';

/**
 * A SockJS client adapted for use with webpack-dev-server.
 * @constructor
 * @param {string} url The socket URL.
 */
function SockJSClient(url) {
  this.socket = new SockJS(url);
}

/**
 * Creates a handler to handle socket close events.
 * @param {function(): void} fn
 */
SockJSClient.prototype.onClose = function onClose(fn) {
  this.socket.onclose = fn;
};

/**
 * Creates a handler to handle socket message events.
 * @param {function(*): void} fn
 */
SockJSClient.prototype.onMessage = function onMessage(fn) {
  this.socket.onmessage = function onMessageHandler(event) {
    fn(event.data);
  };
};

window.__webpack_dev_server_client__ = SockJSClient;
