{{{ polyfillImports }}}
{{{ importsAhead }}}
import { plugin } from './core/umiExports';
import { createHistory } from './core/history';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';
{{{ imports }}}

{{{ entryCodeAhead }}}

const clientRender = plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    return renderClient({
      // @ts-ignore
      routes: require('./core/routes').routes,
      plugin,
      history: createHistory(),
      rootElement: '{{{ rootElement }}}',
    });
  },
  args: {},
});

export default clientRender();

{{{ entryCode }}}

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./core/routes', () => {
    clientRender();
  });
}
