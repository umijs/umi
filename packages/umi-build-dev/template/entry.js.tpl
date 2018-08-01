<%= IMPORT_AHEAD %>
import React from 'react';
import ReactDOM from 'react-dom';
import createHistory from 'umi/_createHistory';
<%= IMPORT %>

// create history
window.g_history = createHistory({
  basename: window.routerBase,
});
<%= HISTORY_MODIFIER %>

// render
function render() {
  <%= RENDER %>
}
render();

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    render();
  });
}
