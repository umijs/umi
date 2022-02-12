#!/usr/bin/env node

// disable since it's conflicted with typescript cjs + dynamic import
// require('v8-compile-cache');
require('../dist/cli/cli')
  .run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
