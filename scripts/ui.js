const { fork } = require('child_process');
const signale = require('signale');
const { join } = require('path');
const { uiPlugins } = require('./uiPlugins');

const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');
const watch = process.argv.includes('-w') || process.argv.includes('--watch');
const opts = {
  watch,
};

const buildPlugin = plugin => {
  const { watch } = opts;
  return new Promise((resolve, reject) => {
    try {
      const pluginProcess = fork(FATHER_BUILD_BIN, watch ? ['--watch'] : [], {
        cwd: join(__dirname, '..', plugin),
      });
      pluginProcess.on('exit', code => {
        if (code === 1) {
          process.exit(1);
        }
        resolve(pluginProcess);
      });
    } catch (e) {
      reject(e);
    }
  });
};

(async () => {
  // exit by Ctrl/Cmd + C
  process.on('SIGINT', () => {
    signale.info('exit build by user');
    process.exit(0);
  });

  const buildQueue = [...uiPlugins.map(buildPlugin)];
  await Promise.all(buildQueue);
})();
