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

startDevServer({
  port: 12341,
  cwd: join(__dirname, '../packages/umi/test/normal'),
});
startDevServer({
  port: 12342,
  cwd: join(__dirname, '../packages/umi/test/hashHistory'),
});
startDevServer({
  port: 12351,
  cwd: join(__dirname, '../packages/umi-plugin-react/test/normal'),
});
startDevServer({
  port: 12352,
  cwd: join(__dirname, '../packages/umi-plugin-react/test/with-dva'),
});
