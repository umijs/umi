import { getClientRootComponent } from '{{{ serverRendererPath }}}';
import { getRoutes } from './core/route';
import { PluginManager } from '{{{ umiPluginPath }}}';
import createRequestHandler from '{{{ umiServerPath }}}';

const routesWithServerLoader = {
{{#routesWithServerLoader}}
  '{{{ id }}}': () => import('{{{ path }}}'),
{{/routesWithServerLoader}}
};

// TODO: support runtime plugins
export function getPlugins() {
  return [];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

export function getManifest() {
  return JSON.parse(require('fs').readFileSync('{{{ assetsPath }}}', 'utf-8'));
}

// TODO: remove global variable
global.g_getAssets = (fileName) => {
  let m = typeof manifest === 'function' ? manifest() : manifest;
  return m.assets[fileName];
};

const manifest = {{{ env }}} === 'development' ? getManifest : getManifest();
const requestHandler = createRequestHandler({
  routesWithServerLoader,
  PluginManager,
  getPlugins,
  getValidKeys,
  getRoutes,
  manifest,
  getClientRootComponent,
});

export default requestHandler;
