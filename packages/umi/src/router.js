/* global window */
import { addRouterBase, normalizePath } from './utils';

function isAlipayContainer() {
  const ua = window.navigator.userAgent;
  const isAlipayIDE = /AlipayIDE/.test(ua);
  const isAlipay = /AliApp\(AP\/([\d\.]+)\)/i.test(ua);
  const isKoubei = /AliApp\(KB\/([\d\.]+)\)/i.test(ua);
  const isKoubeiMerchant = /AliApp\(AM\/([\d\.]+)\)/i.test(ua);
  return (
    !isAlipayIDE &&
    typeof ap !== 'undefined' &&
    (isAlipay || isKoubei || isKoubeiMerchant)
  );
}

function push(path) {
  if (isAlipayContainer()) {
    window.ap.pushWindow(addRouterBase(normalizePath(path)));
  } else {
    window.koi_history.push(normalizePath(path));
  }
}

function replace(path) {
  if (isAlipayContainer()) {
    window.ap.redirectTo(addRouterBase(normalizePath(path)));
  } else {
    window.koi_history.replace(normalizePath(path));
  }
}

function go(count) {
  if (isAlipayContainer()) {
    window.ap.popTo(count);
  } else {
    window.koi_history.go(count);
  }
}

function goBack() {
  if (isAlipayContainer()) {
    window.ap.popWindow();
  } else {
    window.koi_history.goBack();
  }
}

export default {
  push,
  replace,
  go,
  goBack,
};
