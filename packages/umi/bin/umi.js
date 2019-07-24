#!/usr/bin/env node

const resolveCwd = require('resolve-cwd');
const path = require('path');
const { coverageReport } = require('umi-test');

coverageReport({
  targetDir: path.join(__dirname, '../../../node_modules'),
  fileName: 'umijs',
});

const localCLI = resolveCwd.silent('umi/bin/umi');
if (localCLI && localCLI !== __filename) {
  const debug = require('debug')('umi');
  debug('Using local install of umi');
  require(localCLI);
} else {
  require('../lib/cli');
}
