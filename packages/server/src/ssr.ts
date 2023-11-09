import React, { ReactElement } from 'react';
import * as ReactDomServer from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import { Writable } from 'stream';
import type {
  IRoutesById,
  IServerLoaderArgs,
  MetadataLoader,
  ServerLoader,
  UmiRequest,
} from './types';

interface RouteLoaders {
  [key: string]: () => Promise<any>;
}

export type ServerInsertedHTMLHook = (callbacks: () => React.ReactNode) => void;

interface CreateRequestServerlessOptions {
  /**
   * folder path for `build-manifest.json`
   */
  sourceDir?: string;
}

interface CreateRequestHandlerOptions extends CreateRequestServerlessOptions {
  routesWithServerLoader: RouteLoaders;
  PluginManager: any;
  manifest:
    | ((sourceDir?: string) => { assets: Record<string, string> })
    | { assets: Record<string, string> };
  getPlugins: () => any;
  getValidKeys: () => any;
  getRoutes: (PluginManager: any) => any;
  getClientRootComponent: (PluginManager: any) => any;
  createHistory: (opts: any) => any;
  helmetContext?: any;
  ServerInsertedHTMLContext: React.Context<ServerInsertedHTMLHook | null>;
}

interface IExecLoaderOpts {
  routeKey: string;
  routesWithServerLoader: RouteLoaders;
  serverLoaderArgs?: IServerLoaderArgs;
}

interface IExecMetaLoaderOpts extends IExecLoaderOpts {
  serverLoaderData?: any;
}

const createJSXProvider = (
  Provider: any,
  serverInsertedHTMLCallbacks: Set<() => React.ReactNode>,
) => {
  const JSXProvider = (props: any) => {
    const addInsertedHtml = React.useCallback(
      (handler: () => React.ReactNode) => {
        serverInsertedHTMLCallbacks.add(handler);
      },
      [],
    );

    return React.createElement(Provider, {
      children: props.children,
      value: addInsertedHtml,
    });
  };
  return JSXProvider;
};

function createJSXGenerator(opts: CreateRequestHandlerOptions) {
  return async (url: string, serverLoaderArgs?: IServerLoaderArgs) => {
    const {
      routesWithServerLoader,
      PluginManager,
      getPlugins,
      getValidKeys,
      getRoutes,
      createHistory,
      sourceDir,
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

    const loaderData: Record<string, any> = {};
    const metadata: Record<string, any> = {};
    await Promise.all(
      matches
        .filter((id: string) => routes[id].hasServerLoader)
        .map(
          (id: string) =>
            new Promise<void>(async (resolve) => {
              loaderData[id] = await executeLoader({
                routeKey: id,
                routesWithServerLoader,
                serverLoaderArgs,
              });
              // 如果有metadataLoader，执行metadataLoader
              // metadataLoader在serverLoader返回之后执行这样metadataLoader可以使用serverLoader的返回值
              // 如果有多层嵌套路由和合并多层返回的metadata但最里层的优先级最高
              if (routes[id].hasMetadataLoader) {
                Object.assign(
                  metadata,
                  await executeMetadataLoader({
                    routesWithServerLoader,
                    routeKey: id,
                    serverLoaderArgs,
                    serverLoaderData: loaderData[id],
                  }),
                );
              }
              resolve();
            }),
        ),
    );

    const manifest =
      typeof opts.manifest === 'function'
        ? opts.manifest(sourceDir)
        : opts.manifest;
    const context = {
      routes,
      routeComponents,
      pluginManager,
      location: url,
      manifest,
      loaderData,
      metadata,
    };

    const element = (await opts.getClientRootComponent(
      context,
    )) as ReactElement;

    return {
      element,
      manifest,
    };
  };
}

const getGenerateStaticHTML = (
  serverInsertedHTMLCallbacks?: Set<() => React.ReactNode>,
) => {
  return (
    ReactDomServer.renderToString(
      React.createElement(React.Fragment, {
        children: Array.from(serverInsertedHTMLCallbacks || []).map(
          (callback) => callback(),
        ),
      }),
    ) || ''
  );
};

export function createMarkupGenerator(opts: CreateRequestHandlerOptions) {
  const jsxGeneratorDeferrer = createJSXGenerator(opts);

  return async (url: string) => {
    const jsx = await jsxGeneratorDeferrer(url);
    if (jsx) {
      return new Promise(async (resolve, reject) => {
        const serverInsertedHTMLCallbacks: Set<() => React.ReactNode> =
          new Set();
        const JSXProvider = createJSXProvider(
          opts.ServerInsertedHTMLContext.Provider,
          serverInsertedHTMLCallbacks,
        );

        let chunks: Buffer[] = [];
        const writable = new Writable();

        writable._write = (chunk, _encoding, next) => {
          chunks.push(Buffer.from(chunk));
          next();
        };
        writable.on('finish', async () => {
          let html = Buffer.concat(chunks).toString('utf8');
          html += await getGenerateStaticHTML(serverInsertedHTMLCallbacks);
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

          resolve(html);
        });

        // why not use `renderToStaticMarkup` or `renderToString`?
        // they will return empty root by unknown reason (maybe umi has suspense logic?)
        const stream = ReactDomServer.renderToPipeableStream(
          React.createElement(JSXProvider, { children: jsx.element }),
          {
            onShellReady() {
              stream.pipe(writable);
            },
            onError: reject,
          },
        );
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
      // 在浏览器中触发的__serverLoader请求的request应该和SSR时拿到的request一致，都是当前页面的URL
      // 否则会导致serverLoader中的request.url和SSR时拿到的request.url不一致
      // 进而导致浏览器中触发的__serverLoader请求传入的参数和SSR时拿到的参数不一致，导致数据不一致
      const serverLoaderRequest = new Request(req.query.url, {
        headers: req.headers,
      });
      const data = await executeLoader({
        routeKey: req.query.route,
        routesWithServerLoader: opts.routesWithServerLoader,
        serverLoaderArgs: { request: serverLoaderRequest },
      });
      res.status(200).json(data);
      return;
    }

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const request = new Request(fullUrl, {
      headers: req.headers,
    });
    const jsx = await jsxGeneratorDeferrer(req.url, { request });

    if (!jsx) return next();

    const writable = new Writable();

    writable._write = (chunk, _encoding, next) => {
      res.write(chunk);
      next();
    };

    writable.on('finish', async () => {
      res.write(await getGenerateStaticHTML());
      res.end();
    });

    const stream = await ReactDomServer.renderToPipeableStream(jsx.element, {
      bootstrapScripts: [jsx.manifest.assets['umi.js'] || '/umi.js'],
      onShellReady() {
        stream.pipe(writable);
      },
      onError(x: any) {
        console.error(x);
      },
    });
  };
}

// 新增的给CDN worker用的SSR请求handle
export function createUmiHandler(opts: CreateRequestHandlerOptions) {
  return async function (
    req: UmiRequest,
    params?: CreateRequestHandlerOptions,
  ) {
    const jsxGeneratorDeferrer = createJSXGenerator({
      ...opts,
      ...params,
    });
    const loaderArgs: IServerLoaderArgs = {
      request: req,
    };
    const jsx = await jsxGeneratorDeferrer(
      new URL(req.url).pathname,
      loaderArgs,
    );

    if (!jsx) {
      throw new Error('no page resource');
    }

    return ReactDomServer.renderToNodeStream(jsx.element);
  };
}

export function createUmiServerLoader(opts: CreateRequestHandlerOptions) {
  return async function (req: UmiRequest) {
    const query = Object.fromEntries(new URL(req.url).searchParams);
    // 切换路由场景下，会通过此 API 执行 server loader
    const serverLoaderRequest = new Request(query.url, {
      headers: req.headers,
    });
    return await executeLoader({
      routeKey: query.route,
      routesWithServerLoader: opts.routesWithServerLoader,
      serverLoaderArgs: { request: serverLoaderRequest },
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

async function executeLoader(params: IExecLoaderOpts) {
  const { routeKey, routesWithServerLoader, serverLoaderArgs } = params;
  const mod = await routesWithServerLoader[routeKey]();
  if (!mod.serverLoader || typeof mod.serverLoader !== 'function') {
    return;
  }
  // TODO: 处理错误场景
  return (mod.serverLoader satisfies ServerLoader)(serverLoaderArgs);
}

async function executeMetadataLoader(params: IExecMetaLoaderOpts) {
  const {
    routesWithServerLoader,
    routeKey,
    serverLoaderArgs,
    serverLoaderData,
  } = params;
  const mod = await routesWithServerLoader[routeKey]();
  if (!mod.serverLoader || typeof mod.serverLoader !== 'function') {
    return;
  }
  return (mod.metadataLoader satisfies MetadataLoader)(
    serverLoaderData,
    serverLoaderArgs,
  );
}
