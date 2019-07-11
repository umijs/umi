const { fork } = require('child_process');
const { join } = require('path');

const UMI_BIN = join(__dirname, '../packages/umi/bin/umi.js');
const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');

function buildUIApp(opts = {}) {
  console.log(`Build ui app`);
  const { watch } = opts;
  fork(UMI_BIN, ['build', '--cwd', './ui', ...(watch ? ['--watch'] : [])]);
}

function buildPlugins(root, opts = {}) {
  console.log(`Build for ${root}`);
  const { watch } = opts;
  process.chdir(root);
  fork(FATHER_BUILD_BIN, watch ? ['--watch'] : []);
}

(async () => {
  const watch = process.argv.includes('-w') || process.argv.includes('--watch');
  buildUIApp({
    watch,
  });
  buildPlugins('packages/umi-build-dev/src/plugins/commands/ui/plugins/blocks', {
    watch,
  });
})();
