#!/usr/bin/env node

const test = require('../lib').default;

test().catch(e => {
  console.log(e);
});
