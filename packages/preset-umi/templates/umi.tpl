{{{ polyfillImports }}}
{{{ importsAhead }}}
import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { createHistory } from './core/history';
{{#loadingComponent}}
import Loading from '{{{ loadingComponent }}}';
{{/loadingComponent}}
import { ApplyPluginsType } from 'umi';
{{{ imports }}}

const publicPath = "{{{ publicPath }}}";
const runtimePublicPath = {{{ runtimePublicPath }}};

async function render() {
  const pluginManager = createPluginManager();
  const { routes, routeComponents } = await getRoutes(pluginManager);

  // allow user to extend routes
  await pluginManager.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: {
      routes,
      routeComponents,
    },
  });

  const contextOpts = pluginManager.applyPlugins({
    key: 'modifyContextOpts',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });

  const basename = contextOpts.basename || '{{{ basename }}}';
  const historyType = contextOpts.historyType || '{{{ historyType }}}';

  const history = createHistory({
    type: historyType,
    basename,
    ...contextOpts.historyOpts,
  });

  return (pluginManager.applyPlugins({
    key: 'render',
    type: ApplyPluginsType.compose,
    initialValue() {
      const context = {
{{#hydrate}}
        hydrate: true,
{{/hydrate}}
        useStream: {{{useStream}}},
{{#reactRouter5Compat}}
        reactRouter5Compat: true,
{{/reactRouter5Compat}}
        routes,
        routeComponents,
        pluginManager,
        mountElementId: '{{{mountElementId}}}',
        rootElement: contextOpts.rootElement || document.getElementById('{{{ mountElementId }}}'),
{{#loadingComponent}}
        loadingComponent: Loading,
{{/loadingComponent}}
        publicPath,
        runtimePublicPath,
        history,
        historyType,
        basename,
        __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {{{__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED}}},
        callback: contextOpts.callback,
      };
      const modifiedContext = pluginManager.applyPlugins({
        key: 'modifyClientRenderOpts',
        type: ApplyPluginsType.modify,
        initialValue: context,
      });
      return renderClient(modifiedContext);
    },
  }))();
}

{{{ entryCodeAhead }}}
render();
{{{ entryCode }}}
