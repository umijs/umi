#!/usr/bin/env node

const yParser = require('yargs-parser');
const args = yParser(process.argv.slice(2), {
  alias: {
    watch: ['w'],
    version: ['v'],
  },
});

if (args.version) {
  console.log(require('../package').version);
  process.exit(0);
}

require('../lib').default({
  ...args,
}).catch(e => {
  console.error(e);
  process.exit(1);
});
