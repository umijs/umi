{{{ polyfillImports }}}
{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

{{{ codeAhead }}}

// create history
window.g_history = {{{ history }}};

// runtime plugins
window.g_plugins = require('umi/_runtimePlugin');
window.g_plugins.init({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
window.g_plugins.use(require('{{{ . }}}'));
{{/plugins}}

// render
let oldRender = () => {
  console.log('render');
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
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
});

{{{ code }}}

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    oldRender();
  });
}
