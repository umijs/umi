import { plugin, ApplyPluginsType } from 'umi';

const routes = {{{ routes }}};

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export default routes;
