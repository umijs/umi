#!/usr/bin/env node

require('v8-compile-cache');

const updateNotifier = require('update-notifier');
const resolveCwd = require('@umijs/deps/compiled/resolve-cwd');

const pkg = require('../package.json');
const { name, bin } = pkg;

// Notify update to Umi4
updateNotifier({
  pkg,
  shouldNotifyInNpmScript: true,
  updateCheckInterval: 0
}).notify();

const localCLI = resolveCwd.silent(`${name}/${bin['umi']}`);
if (!process.env.USE_GLOBAL_UMI && localCLI && localCLI !== __filename) {
  const debug = require('@umijs/utils').createDebug('umi:cli');
  debug('Using local install of umi');
  require(localCLI);
} else {
  require('../lib/cli');
}
