const { fork } = require('child_process');
const { join } = require('path');
const { uiPlugins } = require('./uiPlugins');

function buildUIApp(opts = {}) {
  console.log(`Build ui app`);
  const UMI_BIN = join(__dirname, '../packages/umi/bin/umi.js');
  const { watch } = opts;
  const child = fork(UMI_BIN, [watch ? 'dev' : 'build', ...(watch ? ['--watch'] : [])], {
    env: {
      APP_ROOT: './packages/umi-ui/client',
      UMI_UI: 'none',
      UMI_UI_SERVER: 'none',
    },
  });
  process.on('exit', () => {
    child.kill('SIGTERM');
    console.log('exit build UIApp');
    process.exit();
  });
  process.on('SIGINT', () => {
    console.log('Build for all done');
    child.kill('SIGTERM');
    process.exit();
  });
}

const buildPlugins = async (plugins, opts = {}) => {
  const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');
  const buildChildren = [];
  for (const plugin of plugins) {
    console.log(`current build plugin: ${plugin}`);
    const { watch } = opts;
    try {
      const child = fork(FATHER_BUILD_BIN, watch ? ['--watch'] : [], {
        cwd: join(__dirname, '..', plugin),
      });
      buildChildren.push(child);
      // eslint-disable-next-line no-await-in-loop
      // console.log('childchild', child);
    } catch (e) {
      console.error('current build plugin error: ', e);
    }
  }
  process.on('exit', () => {
    buildChildren.forEach(child => {
      if (child) {
        child.kill('SIGTERM');
      }
    });
    process.exit();
  });
  process.on('SIGINT', () => {
    buildChildren.forEach(child => {
      if (child) {
        child.kill('SIGTERM');
      }
    });
    process.exit();
  });
  console.log('Build for plugins done');
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
