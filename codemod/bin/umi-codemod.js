#!/usr/bin/env node

// need node's version 14+
const v = process.version;
require('assert')(
  require('@umijs/utils').semver.satisfies(v, '>=14'),
  `需要 node 版本 14+，但当前版本为：${v}，请先升级 node 到 v14+。如确认 node 版本已经达到 v14+ 但仍看到该错误提示，请尝试执行 \`rm -rf node_modules && tnpx @alipay/bigfish-4-codemod\` 重试。`,
);

require('../dist/cli');
