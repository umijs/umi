import React from 'react';
import ReactDOM from 'react-dom';
import { history, plugin, ApplyPluginsType } from 'umi';
import { renderClient } from '@umijs/renderer-react';

let clientRender = function() {
  renderClient({
    routes: require('./routes').default,
    plugin,
    history,
    rootElement: 'root',
  });
};
clientRender = plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: clientRender,
  args: {},
});

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}
