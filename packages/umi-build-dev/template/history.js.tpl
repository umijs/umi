// create history
let history = {{{ history }}};
{{#globalVariables}}
window.g_history = history;
{{/globalVariables}}
export default history;

export const createHistory = () => {
  const newHistory = {{{ history }}};
  history = newHistory;
  {{#globalVariables}}
  window.g_history = newHistory;
  {{/globalVariables}}

  return newHistory;
}

export const setBase = base => {
  window.routerBase = base;
}
