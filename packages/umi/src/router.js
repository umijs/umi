/* global window */
import history from '@@/history';

export function push(...args) {
  history.push(...args);
}

export function replace(...args) {
  history.replace(...args);
}

export function go(...args) {
  history.go(...args);
}

export function goBack(...args) {
  history.goBack(...args);
}

export function goForward(...args) {
  history.goForward(...args);
}

export default {
  push,
  replace,
  go,
  goBack,
  goForward,
};
