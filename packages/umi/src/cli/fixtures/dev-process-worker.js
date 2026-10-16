const net = require('net');

if (process.env.UMI_DEV_TEST_SHUTDOWN === 'delay') {
  process.on('SIGTERM', () => {
    setTimeout(() => process.exit(0), 300);
  });
} else if (process.env.UMI_DEV_TEST_SHUTDOWN === 'ignore') {
  process.on('SIGTERM', () => {});
}

const server = net.createServer();
server.listen(Number(process.env.PORT), '127.0.0.1', () => {
  process.send({
    type: 'FIXTURE_READY',
    pid: process.pid,
    port: server.address().port,
    args: process.argv.slice(2),
    execArgv: process.execArgv,
    mock: process.env.MOCK,
    marker: process.env.UMI_DEV_TEST_MARKER,
  });
});

process.on('message', (message) => {
  if (message.type === 'FIXTURE_RESTART') {
    process.send({ type: 'RESTART', payload: { port: server.address().port } });
  } else {
    process.send(message);
  }
});
