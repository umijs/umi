{{{ importsAhead }}}
import React from 'react';
import ReactDOM from 'react-dom';
{{{ imports }}}

// create history
window.g_history = {{{ history }}};

// render
function render() {
  {{{ render }}}
}
render();

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    render();
  });
}
