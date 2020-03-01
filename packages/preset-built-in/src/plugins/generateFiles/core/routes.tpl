import { ApplyPluginsType{{ #config.dynamicImport }}, dynamic{{ /config.dynamicImport }} } from '{{{ runtimePath }}}';
import { plugin } from './plugin';

const routes = {{{ routes }}};

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };
