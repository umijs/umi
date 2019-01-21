{{{ polyfillImports }}}
{{{ importsAhead }}}
import '@tmp/initHistory';
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

// runtime plugins
window.g_plugins = require('umi/_runtimePlugin');
window.g_plugins.init({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
window.g_plugins.use(require('{{{ . }}}'));
{{/plugins}}

{{{ codeAhead }}}

// render
let oldRender = () => {
  {{{ render }}}
};
const render = window.g_plugins.compose('render', { initialValue: oldRender });

const moduleBeforeRendererPromises = [];
{{# moduleBeforeRenderer }}
if (typeof {{ specifier }} === 'function') {
  const promiseOf{{ specifier }} = {{ specifier }}();
  if (promiseOf{{ specifier }} && promiseOf{{ specifier }}.then) {
    moduleBeforeRendererPromises.push(promiseOf{{ specifier }});
  }
}
{{/ moduleBeforeRenderer }}

Promise.all(moduleBeforeRendererPromises).then(() => {
  render();
}).catch((err) => {
  window.console && window.console.error(err);
});

{{{ code }}}

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    oldRender();
  });
}
