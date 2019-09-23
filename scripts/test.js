const spawn = require('cross-spawn');
const startDevServers = require('./startDevServers');
const startUiServers = require('./startUiServers');

const killServerProcess = (servers, code) => {
  servers.forEach(child => {
    if (child) {
      try {
        child.kill('SIGINT');
      } catch (e) {
        console.error('server child kill error', e);
      }
    }
  });
  process.exit(code);
};

(async () => {
  try {
    const serverRes = await Promise.all([startUiServers(), startDevServers()]);
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

    const servers = serverRes
      .reduce((acc, curr) => [...acc, ...curr], [])
      .map(({ child }) => child)
      .filter(item => item);

    console.log('servers', servers, servers.length);
    testCmd.on('error', code => {
      killServerProcess(servers, code);
    });
    testCmd.on('exit', code => {
      console.log('code', code);
      killServerProcess(servers, code);
    });
  } catch (e) {
    console.error('startServer error', e);
  }
})();
