// create history
let history = {{{ history }}};
{{#globalVariables}}
window.g_history = history;
{{/globalVariables}}
export default history;

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

console.log('test ci');
