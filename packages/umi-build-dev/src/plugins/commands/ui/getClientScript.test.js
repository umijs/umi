import { getFromScriptContent } from './getClientScript';

test('normal', () => {
  expect(getFromScriptContent(['alert(1);', 'alert(2);'])).toEqual(
    `
window.g_uiPlugins = [];
const oldDefine = define;
window.define = (fn) => {
  window.g_uiPlugins.push(fn());
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
