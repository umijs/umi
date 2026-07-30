import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const sockets = new Set();
const server = createServer((_req, res) => {
  res.writeHead(426, { 'Content-Type': 'text/plain' });
  res.end('WebSocket upgrade required.');
});

server.on('upgrade', (req, socket) => {
  if (req.url !== '/ws' || !req.headers['sec-websocket-key']) {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1')
    .update(
      `${req.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
    )
    .digest('base64');
  const message = Buffer.from('connected through the Umi proxy');

  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
  );
  socket.write(Buffer.concat([Buffer.from([0x81, message.length]), message]));
  console.log(`[backend] WebSocket connected: ${req.url}`);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('[backend] listening at ws://127.0.0.1:3000/ws');
});

process.on('SIGINT', () => {
  sockets.forEach((socket) => socket.destroy());
  server.close(() => process.exit(0));
});
