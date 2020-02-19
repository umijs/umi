const { fork } = require('child_process');
const signale = require('signale');
const { join } = require('path');
const { uiPlugins } = require('./uiPlugins');

const UMI_BIN = require.resolve('../packages/umi/bin/umi');
const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');
const watch = process.argv.includes('-w') || process.argv.includes('--watch');
const opts = {
  watch,
};

const uiApp = () => {
  signale.pending('UI App building');
  const { watch } = opts;
  return new Promise((resolve, reject) => {
    try {
      const child = fork(UMI_BIN, [watch ? 'dev' : 'build', ...(watch ? ['--watch'] : [])], {
        env: {
          APP_ROOT: './packages/umi-ui/client',
          UMI_UI: 'none',
          UMI_UI_SERVER: 'none',
        },
      });
      child.on('exit', code => {
        if (code === 1) {
          signale.fatal('UI App build error');
          process.exit(1);
        }
        signale.complete('UI App done');
        resolve(child);
      });
    } catch (e) {
      reject(e);
    }
  });
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

  const buildQueue = [uiApp(), ...uiPlugins.map(buildPlugin)];
  await Promise.all(buildQueue);
})();
