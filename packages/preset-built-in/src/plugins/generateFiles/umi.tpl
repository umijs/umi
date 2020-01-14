import { history, plugin } from '{{{ aliasedTmpPath }}}/core/umiExports';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';

let clientRender = function() {
  renderClient({
    routes: require('./core/umiExports').routes,
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

clientRender();

// hot module replacement
if (module.hot) {
  module.hot.accept('./core/umiExports', () => {
    clientRender();
  });
}
