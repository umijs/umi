import { chalk } from '@umijs/utils';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import WebSocket from '../../compiled/ws';

export function createWebSocketServer(server: HttpServer | HttpsServer) {
  const wss = new WebSocket.Server({
    noServer: true,
  });

  server.on('upgrade', (req, socket, head) => {
    if (req.headers['sec-websocket-protocol'] === 'webpack-hmr') {
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'connected' }));
  });

  wss.on('error', (e: Error & { code: string }) => {
    if (e.code !== 'EADDRINUSE') {
      console.error(
        chalk.red(`WebSocket server error:\n${e.stack || e.message}`),
      );
    }
  });

  return {
    send(message: string) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },

    wss,

    close() {
      wss.close();
    },
  };
}
