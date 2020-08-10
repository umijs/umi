{{{ polyfillImports }}}
{{{ importsAhead }}}
import { plugin } from './core/plugin';
import './core/pluginRegister';
import { createHistory } from './core/history';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { renderClient } from '{{{ rendererPath }}}';
import { routes } from './core/routes';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args: { hot?: boolean; routes: any[] } = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    const opts = plugin.applyPlugins({
      key: 'modifyClientRenderOpts',
      type: ApplyPluginsType.modify,
      initialValue: {
        routes: args.routes,
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

const clientRender = getClientRender({ routes });
export default clientRender();

{{{ entryCode }}}

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./core/routes', () => {
    const ret = require('./core/routes');
    if (ret.then) {
      ret.then(({ routes }) => {
        getClientRender({ hot: true, routes })();
      });
    } else {
      getClientRender({ hot: true, routes: ret.routes })();
    }
  });
}
