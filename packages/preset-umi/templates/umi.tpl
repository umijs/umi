{{{ polyfillImports }}}
{{{ importsAhead }}}
import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { ApplyPluginsType, PluginManager } from 'umi';
{{{ imports }}}

async function render() {
  const pluginManager = createPluginManager();
  const { routes, routeComponents } = await getRoutes(pluginManager);

  // allow user to extend routes
  pluginManager.applyPlugins({
    key: 'patchRoutes',
    type: 'event',
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
