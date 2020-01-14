import express, { Express, IRouterHandler } from 'express';
import http from 'http';
import portfinder from 'portfinder';
import sockjs, { Server as SocketServer, Connection } from 'sockjs';

export interface IOpts {
  compilerMiddleware?: any;
  afterMiddlewares?: any[];
  beforeMiddlewares?: any[];
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
  listeningApp?: http.Server;
  sockets: Connection[] = [];

  constructor(opts: IOpts) {
    this.opts = opts;
    this.app = express();
    this.setupFeatures();
  }

  setupFeatures() {
    (this.opts.beforeMiddlewares || []).forEach(middleware => {
      this.app.use(middleware);
    });
    this.app.use(this.opts.compilerMiddleware);
    (this.opts.afterMiddlewares || []).forEach(middleware => {
      this.app.use(middleware);
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
