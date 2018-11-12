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
const service = (window.g_service = {
  panels: [],
});

export function patchRoutes(routes) {
  service.panels.forEach(panel => {
    routes[0].routes.unshift({
      exact: true,
      ...panel,
    });
  });
}

export function render(oldRender) {
  Object.keys(window.g_umiUIPlugins).forEach(key => {
    window.g_umiUIPlugins[key](new PluginAPI(service));
  });
  oldRender();
}

export const dva = {
  config: {
    initialState: {
      service: window.g_service,
    },
  },
};
