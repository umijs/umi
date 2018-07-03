#!/usr/bin/env node

const getConfig = require('../lib/getConfig/index');

const cwd = process.cwd();
const webpackConfig = getWebpackConfig();

switch (process.argv[2]) {
  case 'dev':
    require('../dev').default({
      cwd,
      webpackConfig,
    });
    break;
  case 'build':
    require('../build').default({
      cwd,
      webpackConfig,
    });
    break;
  default:
    console.error(`Unknown command ${process.argv[2]}`);
    process.exit(1);
}

function getWebpackConfig() {
  return getConfig.default({
    cwd,
    entry: {
      index: './index.js',
    },
  });
}
