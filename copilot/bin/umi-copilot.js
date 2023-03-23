#!/usr/bin/env node

require('../dist/cli').main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
