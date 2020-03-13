{{{ polyfillImports }}}
{{{ importsAhead }}}
import { plugin } from './core/plugin';
import { createHistory } from './core/history';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';
{{{ imports }}}

{{{ entryCodeAhead }}}

const clientRender = plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: ({ hot }: { hot?: boolean } = {}) => {
    return renderClient({
      // @ts-ignore
      routes: require('./core/routes').routes,
      plugin,
      history: createHistory(hot),
      rootElement: '{{{ rootElement }}}',
      defaultTitle: '{{{ defaultTitle }}}',
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
    clientRender({ hot: true });
  });
}
