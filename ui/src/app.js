import { init as initSocket, callRemote } from './socket';

// PluginAPI
class PluginAPI {
  constructor(service) {
    this.service = service;
  }

  addPanel(panel) {
    this.service.panels.push(panel);
  }
}

// service
// eslint-disable-next-line no-multi-assign
const service = (window.g_service = {
  panels: [],
});

// avoid scope problem
const geval = eval;

export async function render(oldRender) {
  // Init socket connect
  try {
    await initSocket({
      onMessage({ type, payload }) {
        if (type === '@@core/log') {
          console.log(`[LOG] ${payload}`);
        }
      },
    });
  } catch (e) {
    console.error('Init socket failed', e);
  }

  // Get script and style from server, and run
  const { script } = await callRemote({ type: '@@core/getInfo' });
  try {
    geval(`;(function(window){;${script}\n})(window);`);
  } catch (e) {
    console.error(`Error occurs while executing script from plugins`);
    console.error(e);
  }

  // Init the plugins
  window.g_uiPlugins.forEach(uiPlugin => {
    uiPlugin(new PluginAPI(service));
  });

  // Do render
  oldRender();
}

export function patchRoutes(routes) {
  service.panels.forEach(panel => {
    routes[0].routes.unshift({
      exact: true,
      ...panel,
    });
  });
}
