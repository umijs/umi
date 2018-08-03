{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

{{{ codeAhead }}}

// create history
window.g_history = {{{ history }}};

// render
function render(hot) {
  {{{ render }}}
}
render();

{{{ code }}}

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    render(true);
  });
}
