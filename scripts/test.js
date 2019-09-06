const spawn = require('cross-spawn');
const startDevServers = require('./startDevServers');

startDevServers()
  .then(devServers => {
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
    testCmd.on('exit', code => {
      devServers.forEach(devServer => {
        if (devServer) {
          devServer.kill('SIGINT');
        }
      });

      console.log('testCmd exit', code);
      process.exit(code);
    });
  })
  .catch(e => {
    console.log('startDevServer error', e);
  });
