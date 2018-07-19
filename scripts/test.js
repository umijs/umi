const { spawn } = require('child_process');
const startDevServers = require('./startDevServers');

startDevServers()
  .then(() => {
    const testCmd = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['run', 'test:coverage'],
      {
        stdio: 'inherit',
      },
    );
    testCmd.on('exit', code => {
      process.exit(code);
    });
  })
  .catch(e => {
    console.log(e);
  });
