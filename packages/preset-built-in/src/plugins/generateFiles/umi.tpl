{{{ polyfillImports }}}
{{{ importsAhead }}}
import { plugin } from './core/plugin';
import { createHistory } from './core/history';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args: { hot?: boolean } = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    const opts = plugin.applyPlugins({
      key: 'modifyClientRenderOpts',
      type: ApplyPluginsType.modify,
      initialValue: {
        // @ts-ignore
        routes: require('./core/routes').routes,
        plugin,
        history: createHistory(args.hot),
        isServer: process.env.__IS_SERVER,
{{#enableSSR}}
        ssrProps: {},
{{/enableSSR}}
{{#dynamicImport}}
        dynamicImport: {{{ dynamicImport }}},
{{/dynamicImport}}
        rootElement: '{{{ rootElement }}}',
{{#enableTitle}}
        defaultTitle: `{{{ defaultTitle }}}`,
{{/enableTitle}}
      },
    });
    return renderClient(opts);
  },
  args,
});

const clientRender = getClientRender();
export default clientRender();

{{{ entryCode }}}

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./core/routes', () => {
    getClientRender({ hot: true })();
  });
}
