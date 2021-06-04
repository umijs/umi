import express from '@umijs/deps/compiled/express';
import portfinder from '@umijs/deps/compiled/portfinder';
import sockjs, { Connection } from '@umijs/deps/compiled/sockjs';
import { delay, got } from '@umijs/utils';
import http from 'http';
import http2 from 'http2';
import { Server as NetServer } from 'net';
import SockJS from 'sockjs-client';
import Server from './Server';

function initSocket({
  url,
  onMessage,
}: {
  url: string;
  onMessage?: any;
}): Promise<WebSocket> {
  return new Promise((resolve) => {
    const sock = new SockJS(url);
    sock.onopen = () => {
      resolve(sock);
    };
    sock.onerror = (e) => {
      console.log('sock error', e);
    };
    sock.onmessage = onMessage || (() => {});
  });
}

test('normal', async () => {
  const server = new Server({
    beforeMiddlewares: [
      (req, res, next) => {
        if (req.path === '/before') {
          res.end('before');
        } else {
          next();
        }
      },
    ],
    afterMiddlewares: [
      (req, res, next) => {
        if (req.path === '/after') {
          res.end('after');
        } else {
          next();
        }
      },
    ],
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.end('compiler');
      } else {
        next();
      }
    },
  });
  const { port, hostname } = await server.listen({
    port: 3000,
    hostname: 'localhost',
  });
  const { body: compilerBody } = await got(
    `http://${hostname}:${port}/compiler`,
  );
  expect(compilerBody).toEqual('compiler');
  const { body: beforeBody } = await got(`http://${hostname}:${port}/before`);
  expect(beforeBody).toEqual('before');
  const { body: afterBody } = await got(`http://${hostname}:${port}/after`);
  expect(afterBody).toEqual('after');

  const messages: string[] = [];
  const sock = await initSocket({
    url: `http://${hostname}:${port}/dev-server`,
    onMessage: (message: { data: string }) => {
      messages.push(message.data);
    },
  });
  server.sockWrite({
    type: 'foo',
    data: 'bar',
  });

  await delay(100);

  expect(messages).toEqual(['{"type":"foo","data":"bar"}']);
  sock.close();
  await delay(100);

  server.listeningApp?.close();
});

test('port', async () => {
  const server = new Server({
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.end('compiler');
      } else {
        next();
      }
    },
  });
  const { port, hostname } = await server.listen({
    // not conflict
    port: 3899,
    hostname: 'localhost',
  });
  const { body: compilerBody } = await got(
    `http://${hostname}:${port}/compiler`,
  );
  expect(compilerBody).toEqual('compiler');
  expect(port).toEqual(3899);

  server.listeningApp?.close();
});

test('compress', async () => {
  const server = new Server({
    compress: { threshold: 0 },
    beforeMiddlewares: [],
    afterMiddlewares: [],
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.setHeader('Content-Type', 'text/plain');
        res.send('compiler');
      } else {
        next();
      }
    },
  });
  const { port, hostname } = await server.listen({
    port: 3003,
    hostname: 'localhost',
  });
  const { body: compilerBody, headers } = await got(
    `http://${hostname}:${port}/compiler`,
    {
      headers: {
        'Accept-Encoding': 'gzip',
      },
    },
  );
  expect(compilerBody).toEqual('compiler');
  expect(headers['content-encoding']).toEqual('gzip');

  server.listeningApp?.close();
});

test('headers', async () => {
  const server = new Server({
    headers: {
      'access-control-allow-origin': '*',
    },
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.setHeader('Content-Type', 'text/plain');
        res.send('compiler');
      } else {
        next();
      }
    },
  });
  const { port, hostname } = await server.listen({
    port: 3004,
    hostname: 'localhost',
  });
  await delay(100);
  const { body: compilerBody, headers } = await got(
    `http://${hostname}:${port}/compiler`,
  );
  expect(compilerBody).toEqual('compiler');
  expect(headers['access-control-allow-origin']).toEqual('*');

  server.listeningApp?.close();
});

test('https', async () => {
  const server = new Server({
    https: true,
    beforeMiddlewares: [],
    afterMiddlewares: [],
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.setHeader('Content-Type', 'text/plain');
        res.send('compiler');
      } else {
        next();
      }
    },
  });
  const { port, hostname } = await server.listen({
    port: 3005,
    hostname: 'localhost',
  });
  const { body: compilerBody, headers } = await got(
    `https://${hostname}:${port}/compiler`,
    {
      rejectUnauthorized: false,
    },
  );
  expect(compilerBody).toEqual('compiler');

  server.listeningApp?.close();
});

test('http2 normal', (done) => {
  const server = new Server({
    https: true,
    beforeMiddlewares: [],
    afterMiddlewares: [],
    compilerMiddleware: (req, res, next) => {
      if (req.path === '/compiler') {
        res.setHeader('Content-Type', 'text/plain');
        res.send('compiler');
      } else {
        next();
      }
    },
  });
  server
    .listen({
      port: 3006,
      hostname: 'localhost',
    })
    .then(({ port, hostname }) => {
      const client = http2.connect(`https://${hostname}:${port}`, {
        rejectUnauthorized: false,
      });
      client.on('error', (err) => {
        console.error(err);
      });

      const http2Req = client.request({ ':path': '/compiler' });

      http2Req.on('response', (headers) => {
        expect(headers[':status']).toEqual(200);
      });

      http2Req.setEncoding('utf8');
      let data = '';
      http2Req.on('data', (chunk) => {
        data += chunk;
      });
      http2Req.on('end', () => {
        expect(data).toEqual('compiler');
        client.close();
        server.listeningApp?.close();
        done();
      });
      http2Req.end();
    });
});

describe('proxy', () => {
  const host = 'localhost';
  let proxyServer1: http.Server;
  let proxyServer1Port: number;
  let proxyServer2: http.Server;
  let proxyServer2Port: number;
  let proxySocketServer: NetServer;

  beforeAll(async () => {
    const app = express();
    app.get('/api', (req, res) => {
      res.json({
        hello: 'umi proxy',
      });
    });
    app.get('/compiler', (req, res) => {
      res.send('proxy compiler');
    });
    app.get('/', (req, res) => {
      res.send('Hello Umi');
    });
    app.get('/users', (req, res) => {
      res.set(req.headers);
      res.json([
        {
          name: 'bar',
        },
      ]);
    });
    proxyServer1Port = await portfinder.getPortPromise({
      port: 3001,
    });
    proxyServer1 = app.listen(proxyServer1Port);

    const app2 = express();
    app2.get('/api2', (req, res) => {
      res.json({
        hello: 'umi proxy2',
      });
    });

    const socket = sockjs.createServer({ prefix: '/socket' });
    socket.on('connection', (conn: Connection) => {
      conn.on('data', (message) => {
        conn.write(message);
      });
      conn.on('close', () => {});
    });
    const listeningApp = http.createServer(app2);
    socket.installHandlers(listeningApp, {
      prefix: '/socket',
    });

    proxyServer2Port = await portfinder.getPortPromise({
      port: 3002,
    });
    proxySocketServer = listeningApp.listen(proxyServer2Port);
  });

  afterAll(() => {
    proxyServer1?.close();
    proxyServer2?.close();
    proxySocketServer?.close();
  });

  it('proxy normal', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else {
          next();
        }
      },
      proxy: {
        '/api2': {
          target: `http://${host}:${proxyServer2Port}`,
          changeOrigin: true,
        },
        '/api/users': {
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
          headers: {
            Authorization: 'Bearer a76eeafbdc77be849425f0dfe2d6a3b2058b1075',
          },
          pathRewrite: { '^/api': '' },
        },
        '/api': {
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
        },
      },
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('compiler');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    const { body: proxyRewriteBody, headers } = await got(
      `http://${hostname}:${port}/api/users`,
    );
    expect(headers.authorization).toEqual(
      'Bearer a76eeafbdc77be849425f0dfe2d6a3b2058b1075',
    );
    expect(proxyRewriteBody).toEqual(JSON.stringify([{ name: 'bar' }]));

    const { body: proxy2Body } = await got(`http://${hostname}:${port}/api2`);
    expect(proxy2Body).toEqual(
      JSON.stringify({
        hello: 'umi proxy2',
      }),
    );
    server.listeningApp?.close();
  });

  it('proxy config refresh', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else {
          next();
        }
      },
      proxy: {
        '/api': {
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
        },
      },
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('compiler');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    // change proxy config
    const newProxy = {
      // @ts-ignore
      '/api2': {
        target: `http://${host}:${proxyServer2Port}`,
        changeOrigin: true,
      },
    };
    server.setupProxy(newProxy, true);

    const { body: proxyChangeBody } = await got(
      `http://${hostname}:${port}/api2`,
    );
    expect(proxyChangeBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy2',
      }),
    );
    server.listeningApp?.close();
  });

  it('proxy multiple targets', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else {
          next();
        }
      },
      proxy: [
        () => ({
          path: '/api2',
          target: `http://${host}:${proxyServer2Port}`,
          changeOrigin: true,
        }),
        {
          context: '/api/users',
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
          headers: {
            Authorization: 'Bearer a76eeafbdc77be849425f0dfe2d6a3b2058b1075',
          },
          pathRewrite: { '^/api': '' },
        },
        {
          path: '/api',
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
        },
      ],
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('compiler');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    const { body: proxyRewriteBody, headers } = await got(
      `http://${hostname}:${port}/api/users`,
    );
    expect(headers.authorization).toEqual(
      'Bearer a76eeafbdc77be849425f0dfe2d6a3b2058b1075',
    );
    expect(proxyRewriteBody).toEqual(JSON.stringify([{ name: 'bar' }]));

    const { body: proxy2Body } = await got(`http://${hostname}:${port}/api2`);
    expect(proxy2Body).toEqual(
      JSON.stringify({
        hello: 'umi proxy2',
      }),
    );
    server.listeningApp?.close();
  });

  it('proxy ws', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        next();
      },
      proxy: {
        '/socket': {
          target: `http://${host}:${proxyServer2Port}`,
          ws: true,
        },
      },
    });

    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });

    const messages: string[] = [];
    const sock = await initSocket({
      url: `http://${hostname}:${port}/socket`,
      onMessage: (message: { data: string }) => {
        messages.push(message.data);
      },
    });

    sock.send('Hello umi');

    await delay(100);

    expect(messages).toEqual(['Hello umi']);
    sock?.close();
    await delay(100);

    server.listeningApp?.close();
  });

  it('proxy single target', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else {
          next();
        }
      },
      proxy: {
        path: '/',
        // proxy all
        target: `http://${host}:${proxyServer1Port}`,
        changeOrigin: true,
      },
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('proxy compiler');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    server.listeningApp?.close();
  });

  it('proxy bypass', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else if (req.path === '/bypass') {
          res.end('bypass');
        } else {
          next();
        }
      },
      proxy: {
        '/api': {
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
          bypass(req) {
            if ((req as any).url === '/api/compiler') {
              return '/bypass';
            }
            return null;
          },
        },
      },
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('compiler');

    const { body: bypassBody } = await got(
      `http://${hostname}:${port}/api/compiler`,
    );
    expect(bypassBody).toEqual('bypass');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    server.listeningApp?.close();
  });
});
