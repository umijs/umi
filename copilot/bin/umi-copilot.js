#!/usr/bin/env node

require('../dist/cli').main().catch((e) => {
  console.error(e);
  process.exit(1);
});
