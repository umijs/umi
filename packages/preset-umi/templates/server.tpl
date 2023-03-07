import { getClientRootComponent } from '{{{ serverRendererPath }}}';
import { getRoutes } from './core/route';
import { createHistory as createClientHistory } from './core/history';
import { getPlugins as getClientPlugins } from './core/plugin';
import { PluginManager } from '{{{ umiPluginPath }}}';
import createRequestHandler, { createMarkupGenerator } from '{{{ umiServerPath }}}';

let helmetContext;

try {
  helmetContext = require('./core/helmetContext').context;
} catch { /* means `helmet: false`, do noting */ }

const routesWithServerLoader = {
{{#routesWithServerLoader}}
  '{{{ id }}}': () => import('{{{ path }}}'),
{{/routesWithServerLoader}}
};

export function getPlugins() {
  return getClientPlugins();
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

export function getManifest() {
  return JSON.parse(require('fs').readFileSync('{{{ assetsPath }}}', 'utf-8'));
}

export function createHistory(opts) {
  return createClientHistory(opts);
}

// TODO: remove global variable
global.g_getAssets = (fileName) => {
  let m = typeof manifest === 'function' ? manifest() : manifest;
  return m.assets[fileName];
};

const manifest = {{{ env }}} === 'development' ? getManifest : getManifest();
const createOpts = {
  routesWithServerLoader,
  PluginManager,
  getPlugins,
  getValidKeys,
  getRoutes,
  manifest,
  getClientRootComponent,
  helmetContext,
  createHistory,
};
const requestHandler = createRequestHandler(createOpts);

export const _markupGenerator = createMarkupGenerator(createOpts);

export default requestHandler;
