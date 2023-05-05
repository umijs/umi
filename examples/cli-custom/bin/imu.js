#!/usr/bin/env node

process.env.FRAMEWORK_NAME = 'imu';

require('../dist/index.js').start().catch(e => {
  console.error(e)
  process.exit(1)
})
