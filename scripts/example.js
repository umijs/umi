#!/usr/bin/env node
const yParser = require('@umijs/deps/compiled/yargs-parser');

const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});
// umi dev path 就是 APP_ROOT=path umi dev
// 担心直接在 umi 库里面修改会有其他问题，因此 example 重新开一个脚本
if (args._[1]) {
  process.env.APP_ROOT = args._[1];
}

require('../packages/umi/lib/cli');
