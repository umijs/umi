const { fork } = require('child_process');
const { join } = require('path');
const { build } = require('father-build/lib/build');
const uiPlugins = require('./uiPlugins');

const UMI_BIN = join(__dirname, '../packages/umi/bin/umi.js');

function buildUIApp(opts = {}) {
  console.log(`Build ui app`);
  const { watch } = opts;
  const child = fork(UMI_BIN, [watch ? 'dev' : 'build', ...(watch ? ['--watch'] : [])], {
    env: {
      APP_ROOT: './packages/umi-ui/client',
      UMI_UI: 'none',
      UMI_UI_SERVER: 'none',
    },
  });
  process.on('SIGINT', () => {
    console.log('Build for all done');
    child.kill('SIGINT');
  });
}

const buildPlugins = async (plugins, opts = {}) => {
  return new Promise(async (resolve, reject) => {
    for (const plugin of plugins) {
      console.log(`current build plugin: ${plugin}`);
      const { watch } = opts;
      try {
        // eslint-disable-next-line no-await-in-loop
        await build({
          cwd: join(__dirname, '..', plugin),
          watch,
        });
      } catch (e) {
        console.error('current build plugin error: ', e);
        reject(e);
      }
    }
    console.log('Build for plugins done');
    resolve();
  });
};

(async () => {
  const watch = process.argv.includes('-w') || process.argv.includes('--watch');

  // 并行执行 ui plugins build 和 UI App build
  await Promise.all([
    // 串行执行 ui plugins 避免插件过多时 OOM
    buildPlugins(uiPlugins, { watch }),
    buildUIApp({ watch }),
  ]);
})();
