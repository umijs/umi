import { getFromScriptContent } from './getClientScript';

xtest('normal', () => {
  expect(getFromScriptContent(['alert(1);', 'alert(2);'])).toEqual(
    `
window.g_uiPlugins = [];
const oldDefine = window.define;
window.define = (deps, fn) => {
  const map = {
    react: window.React,
    'react-dom': window.ReactDOM,
    antd: window.antd,
  };
  if (!Array.isArray(deps)) {
    fn = deps;
    deps = [];
  }
  deps = deps.map(dep => {
    return map[dep];
  });
  window.g_uiPlugins.push(fn.apply(null, deps));
};
define.amd = true;

/* Plugin: 0 */
alert(1);

/* Plugin: 1 */
alert(2);

window.define = oldDefine;
  `.trim(),
  );
});
