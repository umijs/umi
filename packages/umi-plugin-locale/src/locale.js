/* eslint-disable no-undef */
const { FormattedMessage } = require('react-intl');

function setLocale(lang) {
  if (lang !== undefined && !/^([a-z]{2})-([A-Z]{2})$/.test(lang)) {
    // for reset when lang === undefined
    throw new Error('setLocale lang format error');
  }
  window.localStorage.setItem('umi_locale', lang || '');
  window.location.reload();
}

function getLocale() {
  return window.localStorage.getItem('umi_locale');
}

let intl = {
  formatMessage: () => {
    return null;
  },
};

// react-intl 没有直接暴露 formatMessage 这个方法
// 只能注入到 props 中，所以通过在最外层包一个组件然后组件内调用这个方法来把 intl 这个对象暴露到这里来
// TODO 查找有没有更好的办法
function _setIntlObject(theIntl) {
  // umi 系统 API，不对外暴露
  intl = theIntl;
}

function formatMessage() {
  return intl.formatMessage.call(intl, ...arguments);
}

export {
  formatMessage,
  setLocale,
  getLocale,
  FormattedMessage,
  _setIntlObject,
};
