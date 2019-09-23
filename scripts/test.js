const spawn = require('cross-spawn');
const startDevServers = require('./startDevServers');
const startUiServers = require('./startUiServers');

const killServerProcess = (servers, code) => {
  servers.forEach(({ child }) => {
    if (child) {
      child.kill('SIGINT');
    }
  });
  process.exit(code);
};

startDevServers()
  .then(devServers => {
    startUiServers()
      .then(uiServers => {
        const argv = process.argv.slice(2) || [];
        const testCmd = spawn(
          'npm',
          ['run', 'test:coverage'].concat(
            // argv pass down into jest
            argv.length > 0 ? ['--', ...argv] : [],
          ),
          {
            stdio: 'inherit',
          },
        );
        const servers = devServers.concat(uiServers);

        testCmd.on('error', code => {
          killServerProcess(servers, code);
        });
        testCmd.on('exit', code => {
          killServerProcess(servers, code);
        });
      })
      .catch(e => {
        console.log('startUIServer error', e);
      });
  })
  .catch(e => {
    console.log('startDevServer error', e);
  });
