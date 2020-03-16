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

history = createHistory();
Object.defineProperty(exports || module.exports || (module.exports = {}), 'default', { get() { return history; }});
console.log('test ci');
