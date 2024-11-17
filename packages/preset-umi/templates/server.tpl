{{{ importsAhead }}}
import { getClientRootComponent } from '{{{ serverRendererPath }}}';
import { getRoutes } from './core/route';
import { createHistory as createClientHistory } from './core/history';
import { ServerInsertedHTMLContext } from './core/serverInsertedHTMLContext';
import { createPluginManager } from './core/plugin';
import createRequestHandler, { createMarkupGenerator, createUmiHandler, createUmiServerLoader, createAppRootElement } from '{{{ umiServerPath }}}';
import fs from 'fs';
import path from 'path';
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
  let manifestPath;
  if (process.env.SSR_MANIFEST) {
    return JSON.parse(process.env.SSR_MANIFEST)
  } 
  if (sourceDir) {
    manifestPath = path.join(sourceDir,'build-manifest.json')
  }
  else {
    manifestPath = '{{{ assetsPath }}}'
  }
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath), 'utf-8');
  }
  return {
    assets: {}
  }
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
  reactVersion: '{{{reactVersion}}}',
  pluginManager: createPluginManager(),
  getRoutes,
  manifest: getManifest,
  getClientRootComponent,
  helmetContext,
  createHistory,
  ServerInsertedHTMLContext,
  htmlPageOpts: {{{htmlPageOpts}}},
 __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {{{__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED}}},
  mountElementId: '{{{mountElementId}}}',
  basename: '{{{basename}}}',
  useStream: {{{useStream}}}
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

export const g_umi = '{{{version}}}'

{{{ entryCode }}}
