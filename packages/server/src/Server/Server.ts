// @ts-ignore
import { chalk, lodash, portfinder, PartialProps } from '@umijs/utils';
import express, { Express, RequestHandler } from 'express';
import HttpProxyMiddleware from 'http-proxy-middleware';
import http from 'http';
import sockjs, { Connection, Server as SocketServer } from 'sockjs';

interface IServerProxyConfigItem extends HttpProxyMiddleware.Config {
  path?: string | string[];
  context?: string | string[] | HttpProxyMiddleware.Filter;
  bypass?: (
    req: Express.Request,
    res: Express.Response,
    proxyConfig: IServerProxyConfigItem,
  ) => string | null;
}

type IServerProxyConfig =
  | IServerProxyConfigItem
  | Record<string, IServerProxyConfigItem>
  | (IServerProxyConfigItem | (() => IServerProxyConfigItem))[]
  | null;

export interface IServerOpts {
  afterMiddlewares?: RequestHandler<any>[];
  beforeMiddlewares?: RequestHandler<any>[];
  compilerMiddleware?: RequestHandler<any> | null;
  https?: boolean;
  proxy?: IServerProxyConfig;
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
  onConnection?: (param: { connection: Connection; server: Server }) => void;
  onConnectionClose?: (param: { connection: Connection }) => void;
}

const defaultOpts: Required<PartialProps<IServerOpts>> = {
  afterMiddlewares: [],
  beforeMiddlewares: [],
  compilerMiddleware: null,
  https: false,
  onListening: argv => argv,
  onConnection: () => {},
  onConnectionClose: () => {},
  proxy: null,
};

class Server {
  app: Express;
  opts: Required<IServerOpts>;
  socketServer?: SocketServer;
  // @ts-ignore
  listeningApp: http.Server;
  sockets: Connection[] = [];
  // Proxy sockets
  socketProxies: HttpProxyMiddleware.Proxy[] = [];

  constructor(opts: IServerOpts) {
    this.opts = {
      ...defaultOpts,
      ...lodash.omitBy(opts, lodash.isUndefined),
    };
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
        this.setupProxy();
      },
      beforeMiddlewares: () => {
        this.opts.beforeMiddlewares.forEach(middleware => {
          this.app.use(middleware);
        });
      },
      compilerMiddleware: () => {
        if (this.opts.compilerMiddleware) {
          this.app.use(this.opts.compilerMiddleware);
        }
      },
      afterMiddlewares: () => {
        this.opts.afterMiddlewares.forEach(middleware => {
          this.app.use(middleware);
        });
      },
    };

    Object.keys(features).forEach(stage => {
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
          let proxyOptions: IServerProxyConfigItem;
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
              context: correctedContext,
            };
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig: IServerProxyConfigItem) => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return HttpProxyMiddleware(context!, proxyConfig);
      }

      return;
    };

    this.opts.proxy.forEach(proxyConfigOrCallback => {
      let proxyMiddleware: HttpProxyMiddleware.Proxy | undefined;

      let proxyConfig =
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws && proxyMiddleware) {
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
        const bypassUrl = lodash.isFunction(proxyConfig.bypass)
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
    sockets = this.sockets,
    type,
    data,
  }: {
    sockets?: Connection[];
    type: string;
    data?: string | object;
  }) {
    sockets.forEach(socket => {
      socket.write(JSON.stringify({ type, data }));
    });
  }

  createServer() {
    if (this.opts.https) {
      // TODO
    } else {
      this.listeningApp = http.createServer(this.app);
    }
  }

  async listen({
    port = 8000,
    hostname,
  }: {
    port?: number;
    hostname: string;
  }): Promise<{
    port: number;
    hostname: string;
    listeningApp: http.Server;
    server: Server;
  }> {
    const listeningApp = http.createServer(this.app);
    this.listeningApp = listeningApp;
    const foundPort = await portfinder.getPortPromise({ port });
    return new Promise(resolve => {
      listeningApp.listen(foundPort, hostname, 5, () => {
        this.createSocketServer();
        const ret = {
          port: foundPort,
          hostname,
          listeningApp,
          server: this,
        };
        this.opts.onListening(ret);
        resolve(ret);
      });
    });
  }

  createSocketServer() {
    const server = sockjs.createServer({
      log: (severity, line) => {
        if (line.includes('bound to')) return;
        // console.log(`${chalk.gray('[sockjs]')} ${line}`);
      },
    });
    server.installHandlers(this.listeningApp!, {
      prefix: '/dev-server',
    });
    server.on('connection', connection => {
      this.opts.onConnection({
        connection,
        server: this,
      });
      this.sockets.push(connection);
      connection.on('close', () => {
        this.opts.onConnectionClose({
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
