/* global window */

export function push(...args) {
  window.g_history.push(...args);
}

export function replace(...args) {
  window.g_history.replace(...args);
}

export function go(...args) {
  window.g_history.go(...args);
}

export function goBack(...args) {
  window.g_history.goBack(...args);
}

export function goForward(...args) {
  window.g_history.goForward(...args);
}

export default {
  push,
  replace,
  go,
  goBack,
  goForward,
};
