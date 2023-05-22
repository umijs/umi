import type { ReactElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import { Writable } from 'stream';
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
  createHistory: (opts: any) => any;
  helmetContext?: any;
}

function createJSXGenerator(opts: CreateRequestHandlerOptions) {
  return async (url: string) => {
    const {
      routesWithServerLoader,
      PluginManager,
      getPlugins,
      getValidKeys,
      getRoutes,
      createHistory,
    } = opts;

    // make import { history } from 'umi' work
    createHistory({ type: 'memory', initialEntries: [url], initialIndex: 1 });

    const pluginManager = PluginManager.create({
      plugins: getPlugins(),
      validKeys: getValidKeys(),
    });
    const { routes, routeComponents } = await getRoutes(pluginManager);

    // allow user to extend routes
    await pluginManager.applyPlugins({
      key: 'patchRoutes',
      type: 'event',
      args: {
        routes,
        routeComponents,
      },
    });

    const matches = matchRoutesForSSR(url, routes);
    if (matches.length === 0) {
      return;
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
      location: url,
      manifest,
      loaderData,
    };

    return {
      element: (await opts.getClientRootComponent(context)) as ReactElement,
      manifest,
    };
  };
}

export function createMarkupGenerator(opts: CreateRequestHandlerOptions) {
  const jsxGeneratorDeferrer = createJSXGenerator(opts);
  const { PluginManager, getPlugins, getValidKeys } = opts;

  const pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });

  return async (url: string) => {
    const jsx = await jsxGeneratorDeferrer(url);

    if (jsx) {
      return new Promise(async (resolve, reject) => {
        let chunks: Buffer[] = [];
        const writable = new Writable();

        writable._write = (chunk, _encoding, next) => {
          chunks.push(Buffer.from(chunk));
          next();
        };
        writable.on('finish', async () => {
          let html = Buffer.concat(chunks).toString('utf8');

          // append helmet tags to head
          if (opts.helmetContext) {
            html = html.replace(
              /(<\/head>)/,
              [
                opts.helmetContext.helmet.title.toString(),
                opts.helmetContext.helmet.priority.toString(),
                opts.helmetContext.helmet.meta.toString(),
                opts.helmetContext.helmet.link.toString(),
                opts.helmetContext.helmet.script.toString(),
                '$1',
              ]
                .filter(Boolean)
                .join('\n'),
            );
          }

          html = await pluginManager.applyPlugins({
            key: 'modifySSRHtmlComplete',
            args: {
              html,
              jsx,
            },
          });

          resolve(html);
        });

        // why not use `renderToStaticMarkup` or `renderToString`?
        // they will return empty root by unknown reason (maybe umi has suspense logic?)
        const stream = renderToPipeableStream(jsx.element, {
          onShellReady() {
            stream.pipe(writable);
          },
          onError: reject,
        });
      });
    }

    return '';
  };
}

export default function createRequestHandler(
  opts: CreateRequestHandlerOptions,
) {
  const jsxGeneratorDeferrer = createJSXGenerator(opts);

  return async function (req: any, res: any, next: any) {
    // 切换路由场景下，会通过此 API 执行 server loader
    if (req.url.startsWith('/__serverLoader') && req.query.route) {
      const data = await executeLoader(
        req.query.route,
        opts.routesWithServerLoader,
      );
      res.status(200).json(data);
      return;
    }

    const jsx = await jsxGeneratorDeferrer(req.url);

    if (!jsx) return next();

    const stream = renderToPipeableStream(jsx.element, {
      bootstrapScripts: [jsx.manifest.assets['umi.js'] || '/umi.js'],
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
