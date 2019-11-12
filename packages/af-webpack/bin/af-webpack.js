#!/usr/bin/env node

const getWebpackConfig = require('../getWebpackConfig');
const getUserConfig = require('../lib/getUserConfig');

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
  const { config: userConfig } = getUserConfig.default({
    cwd,
    configFile: process.env.AF_CONFIG_FILE || '.webpackrc',
  });
  return getWebpackConfig.default({
    entry: {
      index: './index.js',
    },
    ...userConfig,
    cwd,
  });
}
