/// <reference lib="webworker" />
import type { RequestHandler } from '@umijs/bundler-utils/compiled/express';
import React, { ReactElement } from 'react';
import * as ReactDomServer from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';
import { Writable } from 'stream';
import type {
  IRoutesById,
  IServerLoaderArgs,
  ITplOpts,
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
  tplOpts: ITplOpts;
  renderFromRoot: boolean;
  mountElementId: string;
}

interface IExecLoaderOpts {
  routeKey: string;
  routesWithServerLoader: RouteLoaders;
  serverLoaderArgs?: IServerLoaderArgs;
}

interface IExecMetaLoaderOpts extends IExecLoaderOpts {
  serverLoaderData?: any;
}

const createJSXProvider = (Provider: any) => {
  const serverInsertedHTMLCallbacks: Set<() => React.ReactNode> = new Set();

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
  return [JSXProvider, serverInsertedHTMLCallbacks] as const;
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
    // let metadata: Record<string, any> = {};
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
                const metadataLoaderData = await executeMetadataLoader({
                  routesWithServerLoader,
                  routeKey: id,
                  serverLoaderArgs,
                  serverLoaderData: loaderData[id],
                });
                Object.entries(metadataLoaderData).forEach(([k, v]) => {
                  if (Array.isArray(v)) {
                    opts.tplOpts[k] = (opts.tplOpts[k] || []).concat(v);
                  } else {
                    opts.tplOpts[k] = v;
                  }
                });
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
      tplOpts: opts.tplOpts,
      renderFromRoot: opts.renderFromRoot,
      mountElementId: opts.mountElementId,
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

const SERVER_INSERTED_HTML = 'umi-server-inserted-html';
const getGenerateStaticHTML = (
  serverInsertedHTMLCallbacks: Set<() => React.ReactNode>,
  opts?: {
    wrapper?: boolean;
  },
) => {
  const children = React.createElement(React.Fragment, {
    children: Array.from(serverInsertedHTMLCallbacks || []).map((callback) =>
      callback(),
    ),
  });
  return (
    ReactDomServer.renderToString(
      opts?.wrapper
        ? React.createElement(
            'div',
            { id: SERVER_INSERTED_HTML, hidden: true },
            children,
          )
        : children,
    ) || ''
  );
};

export function createMarkupGenerator(opts: CreateRequestHandlerOptions) {
  const jsxGeneratorDeferrer = createJSXGenerator(opts);

  return async (url: string) => {
    const jsx = await jsxGeneratorDeferrer(url);
    if (jsx) {
      return new Promise(async (resolve, reject) => {
        const [JSXProvider, serverInsertedHTMLCallbacks] = createJSXProvider(
          opts.ServerInsertedHTMLContext.Provider,
        );

        let chunks: Buffer[] = [];
        const writable = new Writable();

        writable._write = (chunk, _encoding, next) => {
          chunks.push(Buffer.from(chunk));
          next();
        };
        writable.on('finish', async () => {
          let html = Buffer.concat(chunks).toString('utf8');
          const serverHTML = getGenerateStaticHTML(serverInsertedHTMLCallbacks);
          if (serverHTML) {
            html = html.replace(/<\/head>/, `${serverHTML}</head>`);
          }
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

type IExpressRequestHandlerArgs = Parameters<RequestHandler>;
type IWorkerRequestHandlerArgs = [
  ev: FetchEvent,
  opts?: { modifyResponse?: (res: Response) => Promise<Response> | Response },
];

export default function createRequestHandler(
  opts: CreateRequestHandlerOptions,
) {
  const jsxGeneratorDeferrer = createJSXGenerator(opts);
  const normalizeHandlerArgs = (
    ...args: IExpressRequestHandlerArgs | IWorkerRequestHandlerArgs
  ) => {
    let ret: {
      req: {
        url: string;
        pathname: string;
        headers: HeadersInit;
        query: { route?: string | null; url?: string | null };
      };
      sendServerLoader(data: any): Promise<void> | void;
      sendPage(
        jsx: NonNullable<Awaited<ReturnType<typeof jsxGeneratorDeferrer>>>,
      ): Promise<void> | void;
      otherwise(): Promise<void> | void;
    };

    const replaceServerHTMLScript = `<script>!function(){var e=document.getElementById("${SERVER_INSERTED_HTML}");e&&(Array.from(e.children).forEach(e=>{document.head.appendChild(e)}),e.remove())}();</script>`;

    if (typeof FetchEvent !== 'undefined' && args[0] instanceof FetchEvent) {
      // worker mode
      const [ev, workerOpts] = args as IWorkerRequestHandlerArgs;
      const { pathname, searchParams } = new URL(ev.request.url);

      ret = {
        req: {
          url: ev.request.url,
          pathname,
          headers: ev.request.headers,
          query: {
            route: searchParams.get('route'),
            url: searchParams.get('url'),
          },
        },
        async sendServerLoader(data) {
          let res = new Response(JSON.stringify(data), {
            headers: {
              'content-type': 'application/json; charset=utf-8',
            },
            status: 200,
          });

          // allow modify response
          if (workerOpts?.modifyResponse) {
            res = await workerOpts.modifyResponse(res);
          }

          ev.respondWith(res);
        },
        async sendPage(jsx) {
          const [JSXProvider, serverInsertedHTMLCallbacks] = createJSXProvider(
            opts.ServerInsertedHTMLContext.Provider,
          );
          // handle route path request
          const stream = await ReactDomServer.renderToReadableStream(
            React.createElement(JSXProvider, undefined, jsx.element),
            {
              bootstrapScripts: [jsx.manifest.assets['umi.js'] || '/umi.js'],
              onError(x: any) {
                console.error(x);
              },
            },
          );

          const transformStream = new TransformStream({
            flush(controller) {
              if (serverInsertedHTMLCallbacks.size) {
                const serverHTML = getGenerateStaticHTML(
                  serverInsertedHTMLCallbacks,
                  { wrapper: true },
                );
                controller.enqueue(serverHTML);
                controller.enqueue(replaceServerHTMLScript);
              }
            },
          });

          stream.pipeThrough(transformStream);

          let res = new Response(stream, {
            headers: {
              'content-type': 'text/html; charset=utf-8',
            },
            status: 200,
          });

          // allow modify response
          if (workerOpts?.modifyResponse) {
            res = await workerOpts.modifyResponse(res);
          }

          ev.respondWith(res);
        },
        otherwise() {
          throw new Error('no page resource');
        },
      };
    } else {
      // express mode
      const [req, res, next] = args as IExpressRequestHandlerArgs;

      ret = {
        req: {
          url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          pathname: req.url,
          headers: req.headers as HeadersInit,
          query: {
            route: req.query.route?.toString(),
            url: req.query.url?.toString(),
          },
        },
        sendServerLoader(data) {
          res.status(200).json(data);
        },
        async sendPage(jsx) {
          const [JSXProvider, serverInsertedHTMLCallbacks] = createJSXProvider(
            opts.ServerInsertedHTMLContext.Provider,
          );
          const writable = new Writable();

          res.type('html');

          writable._write = (chunk, _encoding, cb) => {
            res.write(chunk);
            cb();
          };

          writable.on('finish', async () => {
            if (serverInsertedHTMLCallbacks.size) {
              res.write(
                getGenerateStaticHTML(serverInsertedHTMLCallbacks, {
                  wrapper: true,
                }),
              );
              res.write(replaceServerHTMLScript);
            }
            res.end();
          });

          const stream = ReactDomServer.renderToPipeableStream(
            React.createElement(JSXProvider, undefined, jsx.element),
            {
              bootstrapScripts: [jsx.manifest.assets['umi.js'] || '/umi.js'],
              onShellReady() {
                stream.pipe(writable);
              },
              onError(x: any) {
                console.error(x);
              },
            },
          );
        },
        otherwise: next,
      };
    }

    return ret;
  };

  return async function unifiedRequestHandler(
    ...args: IExpressRequestHandlerArgs | IWorkerRequestHandlerArgs
  ) {
    let jsx;
    const { req, sendServerLoader, sendPage, otherwise } = normalizeHandlerArgs(
      ...args,
    );

    if (
      req.pathname.startsWith('/__serverLoader') &&
      req.query.route &&
      req.query.url
    ) {
      // handle server loader request when route change or csr fallback
      // provide the same request as real SSR, so that the server loader can get the same data
      const serverLoaderRequest = new Request(req.query.url, {
        headers: req.headers,
      });
      const data = await executeLoader({
        routeKey: req.query.route,
        routesWithServerLoader: opts.routesWithServerLoader,
        serverLoaderArgs: { request: serverLoaderRequest },
      });

      await sendServerLoader(data);
    } else if (
      (jsx = await jsxGeneratorDeferrer(req.pathname, {
        request: new Request(req.url, {
          headers: req.headers,
        }),
      }))
    ) {
      // response route page
      await sendPage(jsx);
    } else {
      await otherwise();
    }
  };
}

// 新增的给CDN worker用的SSR请求handle
export function createUmiHandler(opts: CreateRequestHandlerOptions) {
  let isWarned = false;

  return async function (
    req: UmiRequest,
    params?: CreateRequestHandlerOptions,
  ) {
    if (!isWarned) {
      console.warn(
        '[umi] `renderRoot` is deprecated, please use `requestHandler` instead',
      );
      isWarned = true;
    }

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
  let isWarned = false;

  return async function (req: UmiRequest) {
    if (!isWarned) {
      console.warn(
        '[umi] `serverLoader` is deprecated, please use `requestHandler` instead',
      );
      isWarned = true;
    }

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
  const { routesWithServerLoader, routeKey, serverLoaderData } = params;
  const mod = await routesWithServerLoader[routeKey]();
  if (!mod.serverLoader || typeof mod.serverLoader !== 'function') {
    return;
  }
  const result = (mod.metadataLoader satisfies MetadataLoader)(
    serverLoaderData,
  );
  // types IMetadata
  return ['title', 'description', 'keywords', 'lang', 'metas'].reduce(
    (acc, key) => {
      if (Object.prototype.hasOwnProperty.call(result, key))
        acc[key] = result[key];
      return acc;
    },
    {} as any,
  );
}
