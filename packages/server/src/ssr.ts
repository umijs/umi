import { renderToPipeableStream } from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import type { IRoutesById } from './types';

interface RouteLoaders {
  [key: string]: () => Promise<any>;
}

interface CreateRequestHandlerOptions {
  routesWithServerLoader: RouteLoaders;
  PluginManager: any;
  manifest:
    | (() => { assets: Record<string, string> })
    | { assets: Record<string, string> };
  getPlugins: () => any;
  getValidKeys: () => any;
  getRoutes: (PluginManager: any) => any;
  getClientRootComponent: (PluginManager: any) => any;
}

export default function createRequestHandler(
  opts: CreateRequestHandlerOptions,
) {
  return async function (req: any, res: any, next: any) {
    const {
      routesWithServerLoader,
      PluginManager,
      getPlugins,
      getValidKeys,
      getRoutes,
    } = opts;

    // 切换路由场景下，会通过此 API 执行 server loader
    if (req.url.startsWith('/__serverLoader') && req.query.route) {
      const data = await executeLoader(req.query.route, routesWithServerLoader);
      res.status(200).json(data);
      return;
    }

    const pluginManager = PluginManager.create({
      plugins: getPlugins(),
      validKeys: getValidKeys(),
    });
    const { routes, routeComponents } = await getRoutes(pluginManager);

    const matches = matchRoutesForSSR(req.url, routes);
    if (matches.length === 0) {
      return next();
    }

    const loaderData: { [key: string]: any } = {};
    await Promise.all(
      matches
        .filter((id: string) => routes[id].hasServerLoader)
        .map(
          (id: string) =>
            new Promise<void>(async (resolve) => {
              loaderData[id] = await executeLoader(id, routesWithServerLoader);
              resolve();
            }),
        ),
    );

    const manifest =
      typeof opts.manifest === 'function' ? opts.manifest() : opts.manifest;
    const context = {
      routes,
      routeComponents,
      pluginManager,
      location: req.url,
      manifest,
      loaderData,
    };

    const jsx = await opts.getClientRootComponent(context);

    const stream = renderToPipeableStream(jsx, {
      bootstrapScripts: [manifest.assets['umi.js'] || '/umi.js'],
      onShellReady() {
        res.setHeader('Content-type', 'text/html');
        stream.pipe(res);
      },
      onError(x: any) {
        console.error(x);
      },
    });
  };
}

function matchRoutesForSSR(reqUrl: string, routesById: IRoutesById) {
  return (
    matchRoutes(createClientRoutes({ routesById }), reqUrl)?.map(
      (route: any) => route.route.id,
    ) || []
  );
}

function createClientRoutes(opts: any) {
  const { routesById, parentId } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute(routesById[id]);
      const children = createClientRoutes({
        routesById,
        parentId: route.id,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
      }
      return route;
    });
}

function createClientRoute(route: any) {
  const { id, path, index } = route;
  return {
    id,
    path,
    index,
  };
}

async function executeLoader(
  routeKey: string,
  routesWithServerLoader: RouteLoaders,
) {
  const mod = await routesWithServerLoader[routeKey]();
  if (!mod.serverLoader || typeof mod.serverLoader !== 'function') {
    return;
  }
  // TODO: 处理错误场景
  return await mod.serverLoader();
}
