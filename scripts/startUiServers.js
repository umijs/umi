const { fork } = require('child_process');
const { join, dirname } = require('path');

const DEV_SCRIPT = join(__dirname, '../packages/umi/bin/umi.js');

function startDevServer(opts = {}) {
  return new Promise(resolve => {
    const child = fork(DEV_SCRIPT, ['ui'], {
      env: {
        ...process.env,
        // https://github.com/webpack/webpack-dev-server/issues/128
        UV_THREADPOOL_SIZE: '100',
        BROWSER: 'none',
        PROGRESS: 'none',
        UMI_DIR: dirname(require.resolve('../packages/umi/package')),
      },
    });
    child.on('message', args => {
      if (args.type === 'UI_DONE') {
        resolve({
          child,
          data: args.data,
        });
      }
    });
  });
}

function start() {
  return Promise.all([startDevServer()]);
}

module.exports = start;

if (require.main === module) {
  start()
    .then(({ data: { port, url } }) => {
      console.log(`ui server: ${url} are started.`);
    })
    .catch(e => {
      console.log(e);
    });
}
