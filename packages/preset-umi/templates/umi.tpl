{{{ polyfillImports }}}
{{{ importsAhead }}}
import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { PluginManager } from 'umi';
{{{ imports }}}

async function render() {
  const context = {
    ...await getRoutes(),
    pluginManager: createPluginManager(),
  };
  return renderClient(context);
}

{{{ entryCodeAhead }}}
render();
{{{ entryCode }}}
