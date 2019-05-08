{{{ polyfillImports }}}
{{#globalVariables}}
import '@tmp/history';
{{/globalVariables}}
{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

// runtime plugins
const plugins = require('umi/_runtimePlugin');
{{#globalVariables}}
window.g_plugins = plugins;
{{/globalVariables}}
plugins.init({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
plugins.use(require('{{{ . }}}'));
{{/plugins}}

{{{ codeAhead }}}

// render
let oldRender = () => {
  {{{ render }}}
};
const render = plugins.compose('render', { initialValue: oldRender });

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
