import fork from 'umi-build-dev/lib/fork';

const child = fork(require.resolve('./realDev.js'));
child.on('message', data => {
  if (process.send) {
    process.send(data);
  }
});
child.on('exit', code => {
  process.exit(code);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
