import { hydrate, render } from 'react-dom';
import { matchRoutes, RouteConfig } from 'react-router-config';
import { IRoute } from '..';
import getRootContainer from './getRootContainer';
import type { IOpts } from './types';

/**
 * preload for SSR in dynamicImport
 * exec preload Promise function before ReactDOM.hydrate
 * @param Routes
 */
export async function preloadComponent(
  readyRoutes: IRoute[],
  pathname = window.location.pathname,
): Promise<IRoute[]> {
  // using matched routes not load all routes
  const matchedRoutes = matchRoutes(readyRoutes as RouteConfig[], pathname);
  for (const matchRoute of matchedRoutes) {
    const route = matchRoute.route as IRoute;
    // load all preload function, because of only a chance to load
    if (typeof route.component !== 'string' && route.component?.preload) {
      const preloadComponent = await route.component.preload();
      route.component = preloadComponent.default || preloadComponent;
    }
    if (route.routes) {
      route.routes = await preloadComponent(route.routes, pathname);
    }
  }
  return readyRoutes;
}

export default function renderClient(opts: IOpts) {
  const rootContainer = getRootContainer(opts);

  if (opts.rootElement) {
    const rootElement =
      typeof opts.rootElement === 'string'
        ? document.getElementById(opts.rootElement)
        : opts.rootElement;
    const callback = opts.callback || (() => {});

    // flag showing SSR succeed
    if (window.g_useSSR) {
      if (opts.dynamicImport) {
        // dynamicImport should preload current route component
        // first loades);
        preloadComponent(opts.routes).then(function () {
          hydrate(rootContainer, rootElement, callback);
        });
      } else {
        hydrate(rootContainer, rootElement, callback);
      }
    } else {
      render(rootContainer, rootElement, callback);
    }
  } else {
    return rootContainer;
  }
}
