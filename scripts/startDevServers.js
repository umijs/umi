const { fork } = require('child_process');
const { join } = require('path');

const DEV_SCRIPT = join(__dirname, '../packages/umi/lib/scripts/dev.js');

function startDevServer(opts = {}) {
  const { port, cwd } = opts;
  return new Promise(resolve => {
    const child = fork(DEV_SCRIPT, ['dev', '--port', port, '--cwd', cwd], {
      env: {
        CLEAR_CONSOLE: 'none',
        BROWSER: 'none',
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
    [12341, '../packages/umi/test/normal'],
    [12342, '../packages/umi/test/hashHistory'],
    [12351, '../packages/umi-plugin-react/test/normal'],
    [12352, '../packages/umi-plugin-react/test/with-dva'],
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
