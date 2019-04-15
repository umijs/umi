#!/usr/bin/env node

const { fork } = require('child_process');
const { join } = require('path');

function runUmiTools(...args) {
  console.log(['>> yumi-tools', ...args].join(' '));
  return fork(
    join(process.cwd(), 'node_modules/.bin/yumi-tools'),
    [...args].concat(process.argv.slice(2)),
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    },
  );
}

const cp = runUmiTools('build');
cp.on('error', err => {
  console.log(err);
});
cp.on('message', message => {
  if (message === 'BUILD_COMPLETE') {
    runUmiTools('rollup', '-g', 'dva:dva,antd:antd');
  }
});
