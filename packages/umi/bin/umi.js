#!/usr/bin/env node

const resolveCwd = require('resolve-cwd');

const localCLI = resolveCwd.silent('umi/bin/umi');
if (!process.env.USE_GLOBAL_UMI && localCLI && localCLI !== __filename) {
  const debug = require('debug')('umi');
  debug('Using local install of umi');
  require(localCLI);
} else {
  require('../lib/cli');
}
