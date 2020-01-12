import express, { Express, IRouterHandler } from 'express';
import http from 'http';
import portfinder from 'portfinder';

interface IOpts {
  compilerMiddleware: any;
  afterMiddlewares?: any[];
  beforeMiddlewares?: any[];
  onListening?: Function;
}

class Server {
  app: Express;
  opts: IOpts;
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

  async listen({ port, hostname }: { port: number; hostname: string }) {
    const listeningApp = http.createServer(this.app);
    const foundPort = await portfinder.getPortPromise({
      port: port || 8000,
    });
    return listeningApp.listen(foundPort, hostname, 5, () => {
      this.createSocketServer();
      if (this.opts.onListening) {
        this.opts.onListening({
          port: foundPort,
          hostname,
        });
      }
    });
  }

  createSocketServer() {}
}

export default Server;
