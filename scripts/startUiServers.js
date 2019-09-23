const { fork } = require('child_process');
const { join, dirname } = require('path');

const DEV_SCRIPT = join(__dirname, '../packages/umi/bin/umi.js');

function startDevServer(opts = {}) {
  return new Promise(resolve => {
    const child = fork(DEV_SCRIPT, ['ui'], {
      env: {
        ...process.env,
        BROWSER: 'none',
        UMI_DIR: dirname(require.resolve('../packages/umi/package')),
      },
    });
    child.on('message', args => {
      if (args.type === 'UI_SERVER_DONE') {
        resolve({
          child,
          data: args.data,
        });
      }
    });
  });
}

function start() {
  return startDevServer();
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
