const { fork } = require('child_process');
const { join } = require('path');

const isDev = process.argv.includes('--dev');
const UMI_BIN = join(__dirname, '../packages/umi/bin/umi.js');
const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');

async function devUIApp() {
  return new Promise(resolve => {
    console.log(`Start dev server for ui app`);
    const child = fork(UMI_BIN, ['dev', '--cwd', './ui']);
    child.on('message', args => {
      if (args.type === 'DONE') {
        resolve(child);
      }
    });
  });
}

async function buildUIApp() {
  return new Promise(resolve => {
    console.log(`Build ui app`);
    const child = fork(UMI_BIN, ['build', '--cwd', './ui']);
    child.on('close', () => {
      resolve();
    });
  });
}

function buildPlugins(root, opts = {}) {
  console.log(`Build for ${root}`);
  const { watch } = opts;
  process.chdir(root);
  fork(FATHER_BUILD_BIN, watch ? ['--watch'] : []);
}

(async () => {
  if (isDev) {
    await devUIApp();
  } else {
    await buildUIApp();
  }

  buildPlugins('packages/umi-build-dev/src/plugins/commands/ui/plugins/blocks', {
    watch: isDev,
  });
})();
