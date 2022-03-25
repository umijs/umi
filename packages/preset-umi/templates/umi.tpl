{{{ polyfillImports }}}
{{{ importsAhead }}}
import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { createHistory } from './core/history';
{{#loadingComponent}}
import Loading from '@/loading';
{{/loadingComponent}}
import { ApplyPluginsType } from 'umi';
{{{ imports }}}

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
  const context = {
    routes,
    routeComponents,
    pluginManager,
    rootElement: document.getElementById('{{{ mountElementId }}}'),
{{#loadingComponent}}
    loadingComponent: Loading,
{{/loadingComponent}}
    history: createHistory({
      type: '{{{ historyType }}}',
    }),
{{#basename}}
    basename: '{{{ basename }}}',
{{/basename}}
  };

  return (pluginManager.applyPlugins({
    key: 'render',
    type: ApplyPluginsType.compose,
    initialValue() {
      return renderClient(context);
    },
  }))();
}

{{{ entryCodeAhead }}}
render();
{{{ entryCode }}}
