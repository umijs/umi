import express, { Express, RequestHandler } from 'express';
import httpProxyMiddleware from 'http-proxy-middleware';
import http from 'http';
import portfinder from 'portfinder';
import { Proxy } from 'http-proxy-middleware';
import sockjs, { Server as SocketServer, Connection } from 'sockjs';
import { lodash } from '@umijs/utils';

interface IProxyConfigMap {
  [url: string]: IProxyConfigItem;
}

type IProxyConfigItem = {
  path?: string | string[];
  context?: string | string[] | httpProxyMiddleware.Filter;
  bypass?: (
    req: Request,
    res: Response,
    proxyConfig: IProxyConfigItem,
  ) => string | null;
} & httpProxyMiddleware.Config;

type IProxyConfigArray = IProxyConfigItem[];

export interface IOpts {
  compilerMiddleware?: RequestHandler;
  afterMiddlewares?: RequestHandler[];
  beforeMiddlewares?: RequestHandler[];
  proxy?: IProxyConfigMap | IProxyConfigArray | IProxyConfigItem;
  https?: boolean;
  onListening?: {
    ({
      port,
      hostname,
      listeningApp,
      server,
    }: {
      port: number;
      hostname: string;
      listeningApp: http.Server;
      server: Server;
    }): void;
  };
  onConnection?: {
    ({ connection, server }: { connection: Connection; server: Server }): void;
  };
  onConnectionClose?: Function;
}

class Server {
  app: Express;
  opts: IOpts;
  socketServer?: SocketServer;
  // @ts-ignore
  listeningApp: http.Server;
  sockets: Connection[] = [];
  // Proxy sockets
  socketProxies: Proxy[] = [];

  constructor(opts: IOpts) {
    this.opts = opts;
    this.app = express();
    this.setupFeatures();
    this.createServer();

    this.socketProxies.forEach(wsProxy => {
      // subscribe to http 'upgrade'
      // @ts-ignore
      this.listeningApp.on('upgrade', wsProxy.upgrade);
    }, this);
  }

  setupFeatures() {
    const features = {
      proxy: () => {
        if (this.opts.proxy) {
          this.setupProxy();
        }
      },
      beforeMiddlewares: () => {
        (this.opts.beforeMiddlewares || []).forEach(middleware => {
          this.app.use(middleware);
        });
      },
      compilerMiddleware: () => {
        if (this.opts.compilerMiddleware) {
          this.app.use(this.opts.compilerMiddleware);
        }
      },
      afterMiddlewares: () => {
        (this.opts.afterMiddlewares || []).forEach(middleware => {
          this.app.use(middleware);
        });
      },
    };

    Object.keys(features || {}).forEach(stage => {
      features[stage]();
    });
  }

  /**
   * proxy middleware for dev
   * not coupled with build tools (like webpack, rollup, ...)
   */
  setupProxy() {
    if (!this.opts.proxy) {
      return;
    }

    if (!Array.isArray(this.opts.proxy)) {
      if ('target' in this.opts.proxy) {
        this.opts.proxy = [this.opts.proxy];
      } else {
        this.opts.proxy = Object.keys(this.opts.proxy).map(context => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof this.opts.proxy?.[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: this.opts.proxy[context],
            };
          } else {
            proxyOptions = {
              ...(this.opts.proxy?.[context] || {}),
            };
            proxyOptions.context = correctedContext;
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig: IProxyConfigItem): any => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return httpProxyMiddleware(context as any, proxyConfig);
      }
    };

    this.opts.proxy.forEach((proxyConfigOrCallback: any) => {
      let proxyMiddleware: any;

      let proxyConfig =
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.socketProxies.push(proxyMiddleware);
      }

      this.app.use((req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        const isByPassFuncDefined = lodash.isFunction(proxyConfig.bypass);
        const bypassUrl = isByPassFuncDefined
          ? proxyConfig.bypass(req, res, proxyConfig)
          : null;
        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          // @ts-ignore
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      });
    });
  }

  sockWrite({
    sockets,
    type,
    data,
  }: {
    sockets?: Connection[];
    type: string;
    data?: string | object;
  }) {
    (sockets || this.sockets).forEach(socket => {
      socket.write(JSON.stringify({ type, data }));
    });
  }

  createServer() {
    if (this.opts?.https) {
      // TODO
    } else {
      this.listeningApp = http.createServer(this.app);
    }
  }

  async listen({
    port,
    hostname,
  }: {
    port: number;
    hostname: string;
  }): Promise<{
    port: number;
    hostname: string;
    listeningApp: http.Server;
    server: Server;
  }> {
    const listeningApp = http.createServer(this.app);
    this.listeningApp = listeningApp;
    const foundPort = await portfinder.getPortPromise({
      port: port || 8000,
    });
    return new Promise(resolve => {
      listeningApp.listen(foundPort, hostname, 5, () => {
        this.createSocketServer();
        const ret = {
          port: foundPort,
          hostname,
          listeningApp,
          server: this,
        };
        this.opts.onListening?.(ret);
        resolve(ret);
      });
    });
  }

  createSocketServer() {
    const server = sockjs.createServer({
      log: (severity, line) => {
        console.log(line);
      },
    });
    server.installHandlers(this.listeningApp!, {
      prefix: '/dev-server',
    });
    server.on('connection', connection => {
      this.opts.onConnection?.({
        connection,
        server: this,
      });
      this.sockets.push(connection);
      connection.on('close', () => {
        this.opts.onConnectionClose?.({
          connection,
        });
        const index = this.sockets.indexOf(connection);
        if (index >= 0) {
          this.sockets.splice(index, 1);
        }
      });
    });
    this.socketServer = server;
  }
}

export default Server;
