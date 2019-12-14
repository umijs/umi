#!/usr/bin/env node
const { yParser, chalk, debugFactory } = require('@umijs/utils');
const debug = debugFactory('umi:test');

const args = yParser(process.argv.slice(2), {
  alias: {
    watch: ['w'],
    version: ['v'],
  },
});

require('../lib')
  .default(args)
  .catch(e => {
    console.error(chalk.red(e));
    process.exit(1);
  });
