// create history
let history = {{{ history }}};
{{#globalVariables}}
window.g_history = history;
{{/globalVariables}}

export const createHistory = (hotReload = false) => {
  if (!hotReload) {
    history = {{{ history }}};
    {{#globalVariables}}
    window.g_history = history;
    {{/globalVariables}}
  }

  return history;
}

// 仅微前端场景需要，for @umijs/plugin-qiankun
export const setBase = base => {
  window.routerBase = base;
}

// default export 出去的变量不遵循 es module 的动态绑定原则，且 lib 目录中的 history 引入都是 commonjs 的方式
// 比如 lib/router 里是通过 const history = require('@@/history').default 的方式引入 history 的
// 为了在 commonjs 及 import default 两种场景下建立动态绑定关系，通过 Object.defineProperty 的方式 hack 一下
Object.defineProperty(exports || module.exports || module.exports = {}, 'default', { get() { return history; }});
