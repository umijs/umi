import { Request, Response, NextFunction } from 'express';
import { got } from '@umijs/utils';
import SockJS from 'sockjs-client';
import Server from './Server';

function initSocket({
  url,
  onMessage,
}: {
  url: string;
  onMessage: any;
}): Promise<WebSocket> {
  return new Promise(resolve => {
    const sock = new SockJS(url);
    sock.onopen = () => {
      resolve(sock);
    };
    sock.onmessage = onMessage;
  });
}

test('normal', async () => {
  const server = new Server({
    beforeMiddlewares: [
      (req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/before') {
          res.end('before');
        } else {
          next();
        }
      },
    ],
    afterMiddlewares: [
      (req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/after') {
          res.end('after');
        } else {
          next();
        }
      },
    ],
    compilerMiddleware: (req: Request, res: Response, next: NextFunction) => {
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

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(100);

  expect(messages).toEqual(['{"type":"foo","data":"bar"}']);
  sock.close();
  await delay(100);

  server.listeningApp?.close();
});
