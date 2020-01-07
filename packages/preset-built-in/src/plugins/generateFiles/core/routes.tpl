import { ApplyPluginsType } from '{{{ runtimePath }}}';
import { plugin } from '@/.umi/core/umiExports';

const routes = {{{ routes }}};

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };
