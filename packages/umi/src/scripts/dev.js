import fork from 'umi-build-dev/lib/fork';

const child = fork(require.resolve('./realDev.js'));
child.on('exit', code => {
  if (code === 1) {
    process.exit(1);
  }
});

child.on('message', data => {
  if (process.send) {
    process.send(data);
  }
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
