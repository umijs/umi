// create history
let history = {{{ history }}};
{{#globalVariables}}
window.g_history = history;
{{/globalVariables}}
export default history;

export const createHistory = (hotReload = false) => {
  if (!hotReload) {
    const newHistory = {{{ history }}};
    history = newHistory;
    {{#globalVariables}}
    window.g_history = newHistory;
    {{/globalVariables}}
  }

  return history;
}

export const setBase = base => {
  window.routerBase = base;
}
