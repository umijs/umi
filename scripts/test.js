const { spawn } = require('child_process');
const startDevServers = require('./startDevServers');

startDevServers()
  .then(devServers => {
    const testCmd = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['run', 'test:coverage'],
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
