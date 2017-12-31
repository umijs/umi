#!/usr/bin/env node

const test = require('../lib');

test().catch(e => {
  console.log(e);
});
