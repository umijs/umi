import { history, plugin } from '{{{ aliasedTmpPath }}}/core/umiExports';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';

{{{ entryCodeAhead }}}

const clientRender = plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    renderClient({
      // @ts-ignore
      routes: require('./core/umiExports').routes,
      plugin,
      history,
      rootElement: 'root',
    });
  },
  args: {},
});

clientRender();

{{{ entryCode }}}

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./core/umiExports', () => {
    clientRender();
  });
}
