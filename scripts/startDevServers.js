const { fork } = require('child_process');
const { join, dirname } = require('path');

const DEV_SCRIPT = join(__dirname, '../packages/umi/bin/umi.js');

function startDevServer(opts = {}) {
  const { port, cwd } = opts;
  return new Promise(resolve => {
    console.log(`Start dev server for ${cwd}`);
    const child = fork(DEV_SCRIPT, ['dev', '--port', port, '--cwd', cwd], {
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
      if (args.type === 'DONE') {
        resolve(child);
      }
    });
  });
}

function start() {
  const devServers = [
    [12341, '../packages/umi/test/fixtures/dev/normal'],
    [12342, '../packages/umi/test/fixtures/dev/ssr'],
    [12343, '../packages/umi/test/fixtures/dev/ssr-styles'],
    [12344, '../packages/umi/test/fixtures/dev/ssr-dynamicImport'],
  ].map(([port, cwd]) => {
    return startDevServer({ port, cwd: join(__dirname, cwd) });
  });

  return Promise.all(devServers);
}

module.exports = start;

if (require.main === module) {
  start()
    .then(() => {
      console.log('All dev servers are started.');
    })
    .catch(e => {
      console.log(e);
    });
}
