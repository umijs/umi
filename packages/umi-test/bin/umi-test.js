#!/usr/bin/env node

const yParser = require('yargs-parser');
const args = yParser(process.argv.slice(2));

if (args.v || args.version) {
  console.log(require('../package').version);
  process.exit(0);
}

if (args.w) args.watch = args.w;
require('../lib').default({
  ...args,
}).catch(e => {
  console.error(e);
  process.exit(1);
});
