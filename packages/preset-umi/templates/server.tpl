{{{ importsAhead }}}
import { getClientRootComponent } from '{{{ serverRendererPath }}}';
import { getRoutes } from './core/route';
import { createHistory as createClientHistory } from './core/history';
import { ServerInsertedHTMLContext } from './core/serverInsertedHTMLContext';
import { createPluginManager } from './core/plugin';
import createRequestHandler, { createMarkupGenerator, createUmiHandler, createUmiServerLoader, createAppRootElement } from '{{{ umiServerPath }}}';
{{{ imports }}}
{{{ entryCodeAhead }}}
let helmetContext;

try {
  helmetContext = require('./core/helmetContext').context;
} catch { /* means `helmet: false`, do noting */ }

const routesWithServerLoader = {
{{#routesWithServerLoader}}
  '{{{ id }}}': () => import('{{{ path }}}'),
{{/routesWithServerLoader}}
};

export function getManifest(sourceDir) {
  return JSON.parse(require('fs').readFileSync(
  sourceDir ? require('path').join(sourceDir,'build-manifest.json') : '{{{ assetsPath }}}', 'utf-8'));
}

export function createHistory(opts) {
  return createClientHistory(opts);
}

// TODO: remove global variable
global.g_getAssets = (fileName) => {
  let m = getManifest();
  return m.assets[fileName];
};
const createOpts = {
  routesWithServerLoader,
  pluginManager: createPluginManager(),
  getRoutes,
  manifest: getManifest,
  getClientRootComponent,
  helmetContext,
  createHistory,
  ServerInsertedHTMLContext,
  htmlPageOpts: {{{htmlPageOpts}}},
  renderFromRoot: {{{renderFromRoot}}},
  mountElementId: '{{{mountElementId}}}'

};
const requestHandler = createRequestHandler(createOpts);
/**
 * @deprecated  Please use `requestHandler` instead.
 */
export const renderRoot = createUmiHandler(createOpts);
/**
 * @deprecated  Please use `requestHandler` instead.
 */
export const serverLoader = createUmiServerLoader(createOpts);

export const _markupGenerator = createMarkupGenerator(createOpts);

export const getAppRootElement = createAppRootElement.bind(null, createOpts)();

export default requestHandler;

{{{ entryCode }}}
