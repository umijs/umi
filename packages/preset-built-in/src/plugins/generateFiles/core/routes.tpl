import * as umi from 'umi';
import { plugin } from './plugin';
{{ #loadingComponent }}
import LoadingComponent from '{{{ loadingComponent }}}';
{{ /loadingComponent }}

export function getRoutes() {
  const routes = {{{ routes }}};

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: umi.ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
