import React from 'react';
import ReactDOM from 'react-dom';
import createHistory from 'umi/_createHistory';
<%= IMPORT %>

// create history
window.g_history = createHistory({
  basename: window.routerBase,
});

// render
function render() {
  ReactDOM.render(React.createElement(require('./router').default), document.getElementById('root'));
}
render();

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    render();
  });
}
