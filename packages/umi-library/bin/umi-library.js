#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');
const yParser = require('yargs-parser');
const chalk = require('chalk');

// print version and @local
const args = yParser(process.argv.slice(2));
if (args.v || args.version) {
  console.log(require('../package').version);
  if (existsSync(join(__dirname, '../.local'))) {
    console.log(chalk.cyan('@local'));
  }
  process.exit(0);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

switch (args._[0]) {
  case 'build':
    require('../lib/build').default({
      cwd: process.cwd(),
      watch: args.w || args.watch,
    });
    break;
  case 'help':
  case undefined:
    printHelp();
    break;
  default:
    console.error(chalk.red(`Unsupported command ${args._[0]}`));
    process.exit(1);
}

function printHelp() {
  console.log(`
  Usage: umi-library <command> [options]

  Commands:

    ${chalk.green('build')}       build library
  `);
}
