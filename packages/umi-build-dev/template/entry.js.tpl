{{{ polyfillImports }}}
{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

{{{ codeAhead }}}

// create history
window.g_history = {{{ history }}};

// render
function render() {
  {{{ render }}}
}

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
    render();
  });
}
