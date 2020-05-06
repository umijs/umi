// @ts-ignore
import { Logger } from '@umijs/core';
import { lodash, portfinder, PartialProps, semver } from '@umijs/utils';
import express, { Express, RequestHandler } from 'express';
import {
  createProxyMiddleware,
  Options as ProxyOptions,
  RequestHandler as ProxyRequestHandler,
  Filter as ProxyFilter,
} from 'http-proxy-middleware';
import http, { ServerResponse } from 'http';
import { ServerOptions } from 'spdy';
import * as url from 'url';
import https from 'https';
import compress, { CompressionOptions } from 'compression';
import sockjs, { Connection, Server as SocketServer } from 'sockjs';
import { getCredentials } from './utils';

const logger = new Logger('@umijs/server');

interface IServerProxyConfigItem extends ProxyOptions {
  path?: string | string[];
  context?: string | string[] | ProxyFilter;
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

export interface IHttps extends ServerOptions {}

export interface IServerOpts {
  afterMiddlewares?: RequestHandler<any>[];
  beforeMiddlewares?: RequestHandler<any>[];
  compilerMiddleware?: RequestHandler<any> | null;
  https?: IHttps | boolean;
  http2?: boolean;
  headers?: {
    [key: string]: string;
  };
  host?: string;
  port?: number;
  compress?: CompressionOptions | boolean;
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
  compress: true,
  https: !!process.env.HTTPS,
  http2: false,
  onListening: (argv) => argv,
  onConnection: () => {},
  onConnectionClose: () => {},
  proxy: null,
  headers: {},
  // not use
  host: 'localhost',
  port: 8000,
};

class Server {
  app: Express;
  opts: Required<IServerOpts>;
  socketServer?: SocketServer;
  // @ts-ignore
  listeningApp: http.Server;
  // @ts-ignore
  listeninspdygApp: http.Server;
  sockets: Connection[] = [];
  // Proxy sockets
  socketProxies: ProxyRequestHandler[] = [];

  constructor(opts: IServerOpts) {
    this.opts = {
      ...defaultOpts,
      ...lodash.omitBy(opts, lodash.isUndefined),
    };
    this.app = express();
    this.setupFeatures();
    this.createServer();

    this.socketProxies.forEach((wsProxy) => {
      // subscribe to http 'upgrade'
      // @ts-ignore
      this.listeningApp.on('upgrade', wsProxy.upgrade);
    }, this);
  }

  private getHttpsOptions(): object | undefined {
    if (this.opts.https) {
      const credential = getCredentials(this.opts);

      // note that options.spdy never existed. The user was able
      // to set options.https.spdy before, though it was not in the
      // docs. Keep options.https.spdy if the user sets it for
      // backwards compatibility, but log a deprecation warning.
      if (typeof this.opts.https === 'object' && this.opts.https.spdy) {
        // for backwards compatibility: if options.https.spdy was passed in before,
        // it was not altered in any way
        logger.warn(
          'Providing custom spdy server options is deprecated and will be removed in the next major version.',
        );
        return credential;
      } else {
        return {
          spdy: {
            protocols: ['h2', 'http/1.1'],
          },
          ...credential,
        };
      }
    }
    return;
  }

  setupFeatures() {
    const features = {
      compress: () => {
        if (this.opts.compress) {
          this.setupCompress();
        }
      },
      headers: () => {
        if (lodash.isPlainObject(this.opts.headers)) {
          this.setupHeaders();
        }
      },
      beforeMiddlewares: () => {
        this.opts.beforeMiddlewares.forEach((middleware) => {
          // @ts-ignore
          this.app.use(middleware);
        });
      },
      proxy: () => {
        if (this.opts.proxy) {
          this.setupProxy();
        }
      },
      compilerMiddleware: () => {
        if (this.opts.compilerMiddleware) {
          // @ts-ignore
          this.app.use(this.opts.compilerMiddleware);
        }
      },
      afterMiddlewares: () => {
        this.opts.afterMiddlewares.forEach((middleware) => {
          // @ts-ignore
          this.app.use(middleware);
        });
      },
    };

    Object.keys(features).forEach((stage) => {
      features[stage]();
    });
  }

  /**
   * response headers
   */
  setupHeaders() {
    this.app.all('*', (req, res, next) => {
      // eslint-disable-next-line
      res.set(this.opts.headers);
      next();
    });
  }

  /**
   * dev server compress to gzip assets
   */
  setupCompress() {
    const compressOpts = lodash.isBoolean(this.opts.compress)
      ? {}
      : this.opts.compress;
    this.app.use(compress(compressOpts));
  }

  /**
   * proxy middleware for dev
   * not coupled with build tools (like webpack, rollup, ...)
   */
  setupProxy() {
    if (!Array.isArray(this.opts.proxy)) {
      if (this.opts.proxy && 'target' in this.opts.proxy) {
        this.opts.proxy = [this.opts.proxy];
      } else {
        this.opts.proxy = Object.keys(this.opts.proxy || {}).map((context) => {
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
        return createProxyMiddleware(context!, {
          ...proxyConfig,
          onProxyRes(proxyRes: any, req, res) {
            const target =
              typeof proxyConfig.target === 'object'
                ? url.format(proxyConfig.target)
                : proxyConfig.target;
            const realUrl = new URL(req.url || '', target)?.href || '';
            proxyRes.headers['x-real-url'] = realUrl;
          },
        });
      }

      return;
    };

    this.opts.proxy.forEach((proxyConfigOrCallback) => {
      let proxyMiddleware: ProxyRequestHandler | undefined;

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
    sockets.forEach((socket) => {
      socket.write(JSON.stringify({ type, data }));
    });
  }

  private isHttp2() {
    return this.opts.http2 !== false;
  }

  createServer() {
    const httpsOpts = this.getHttpsOptions();
    if (httpsOpts) {
      if (semver.gte(process.version, '10.0.0') && !this.isHttp2()) {
        this.listeningApp = https.createServer(httpsOpts, this.app);
      } else {
        this.listeningApp = require('spdy').createServer(httpsOpts, this.app);
      }
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
    const foundPort = await portfinder.getPortPromise({ port });
    return new Promise((resolve) => {
      this.listeningApp.listen(foundPort, hostname, 5, () => {
        this.createSocketServer();
        const ret = {
          port: foundPort,
          hostname,
          listeningApp: this.listeningApp,
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
    server.on('connection', (connection) => {
      // Windows connection might be undefined
      // https://github.com/webpack/webpack-dev-server/issues/2199
      // https://github.com/sockjs/sockjs-node/issues/121
      // https://github.com/meteor/meteor/pull/10891/files
      if (!connection) {
        return;
      }
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
