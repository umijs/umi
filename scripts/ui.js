const { fork } = require('child_process');
const { join } = require('path');

const UMI_BIN = join(__dirname, '../packages/umi/bin/umi.js');

function buildUIApp(opts = {}) {
  console.log(`Build ui app`);
  const { watch } = opts;
  const child = fork(UMI_BIN, [watch ? 'dev' : 'build', ...(watch ? ['--watch'] : [])], {
    env: {
      APP_ROOT: './packages/umi-ui/client',
      UMI_UI: 'none',
    },
  });
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
}

function buildPlugins(roots, opts = {}) {
  return roots.map(root => {
    console.log(`Build for ${root}`);
    const { watch } = opts;
    return require('father-build/lib/build').build({
      cwd: join(__dirname, '..', root),
      watch,
    });
  });
}

(async () => {
  const watch = process.argv.includes('-w') || process.argv.includes('--watch');
  try {
    await Promise.all(
      buildPlugins(
        [
          'packages/umi-plugin-ui/src/plugins/dashboard',
          'packages/umi-plugin-ui/src/plugins/blocks',
          'packages/umi-plugin-ui/src/plugins/configuration',
        ],
        {
          watch,
        },
      ),
    );
  } catch (e) {
    console.error('Build plugins failed', e);
  }
  console.log('Build for plugins done');
  buildUIApp({
    watch,
  });
})();
