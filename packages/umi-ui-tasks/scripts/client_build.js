const FATHER_BUILD_BIN = require.resolve('father-build/bin/father-build.js');
const { fork } = require('child_process');
const { join } = require('path');

const isWatchMode = process.argv.includes('-w') || process.argv.includes('--watch');

const BUILD_CONFIG = {
  cwd: join(__dirname, '../src'),
  args: isWatchMode ? ['--watch'] : [],
};

const { cwd, args } = BUILD_CONFIG;

fork(FATHER_BUILD_BIN, args, { cwd });
