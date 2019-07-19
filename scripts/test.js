const { spawn } = require('child_process');
const startDevServers = require('./startDevServers');

startDevServers()
  .then(devServers => {
    const argv = process.argv.slice(2) || [];
    const testCmd = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['run', 'test:coverage'].concat(
        // argv pass down into jest
        argv.length > 0 ? ['--', ...argv] : [],
      ),
      {
        stdio: 'inherit',
      },
    );
    testCmd.on('exit', code => {
      devServers.forEach(devServer => devServer && devServer.kill('SIGINT'));
      process.exit(code);
    });
  })
  .catch(e => {
    console.log(e);
  });
