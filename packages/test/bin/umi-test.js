#!/usr/bin/env node
const { yParser, chalk, createDebug } = require('@umijs/utils');
const debug = createDebug('umi:test');

const args = yParser(process.argv.slice(2), {
  alias: {
    watch: ['w'],
    version: ['v'],
  },
  boolean: ['coverage', 'watch', 'version', 'debug', 'e2e'],
  default: {
    e2e: true,
  },
});

require('../lib')
  .default(args)
  .catch((e) => {
    console.error(chalk.red(e));
    process.exit(1);
  });
