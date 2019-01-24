const { fork } = require('child_process');
const { join, dirname } = require('path');

const DEV_SCRIPT = join(__dirname, '../packages/umi/bin/umi.js');

function startDevServer(opts = {}) {
  const { port, cwd } = opts;
  return new Promise(resolve => {
    const child = fork(DEV_SCRIPT, ['dev', '--port', port, '--cwd', cwd], {
      env: {
        ...process.env,
        CLEAR_CONSOLE: 'none',
        BROWSER: 'none',
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
    [12341, '../packages/umi/test/fixtures/e2e/normal'],
    [12342, '../packages/umi/test/fixtures/e2e/hashHistory'],
    [12351, '../packages/umi-plugin-react/test/normal'],
    [12352, '../packages/umi-plugin-react/test/with-dva'],
    [12353, '../packages/umi-plugin-react/test/pwa'],
  ];

  return Promise.all(
    devServers.map(([port, cwd]) => {
      return startDevServer({ port, cwd: join(__dirname, cwd) });
    }),
  );
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
