const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');
const { fork } = require('child_process');
const { join } = require('path');

const isWatchMode = process.argv.includes('-w') || process.argv.includes('--watch');

const sleep = async time => {
  return new Promise(resolve => {
    setTimeout(resolve, 3000);
  });
};

const BUILD_CONFIGS = [
  {
    name: 'client',
    cwd: join(__dirname, '../src'),
    args: isWatchMode ? ['--watch'] : [],
  },
  {
    name: 'server',
    cwd: join(__dirname, '..'),
    args: isWatchMode ? ['--watch'] : [],
    before: async () => {
      await sleep(1000);
    },
  },
];

BUILD_CONFIGS.forEach(async ({ name, cwd, args, before }) => {
  console.log(`Begin ${name} build`);
  if (before) {
    await before();
  }
  const cp = fork(FATHER_BUILD_BIN, args, { cwd });
  cp.on('exit', code => {
    process.exit(code);
  });
  process.on('exit', () => {
    cp.kill('SIGINT');
  });
});
