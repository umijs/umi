#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');
const yParser = require('yargs-parser');
const chalk = require('chalk');

// print version and @local
const args = yParser(process.argv.slice(2));
if (args.v || args.version) {
  console.log(require('../package').version);
  if (existsSync(join(__dirname, '../.local'))) {
    console.log(chalk.cyan('@local'));
  }
  process.exit(0);
}

const express = require('express');
const { winPath } = require('umi-utils');
const getUserConfig = require('umi-core/lib/getUserConfig').default;
const getPaths = require('umi-core/lib/getPaths').default;
const port = 8001;
const cwd = process.cwd();

let paths;

// 获取 config 之前先注册一遍
registerBabel();

const config = getUserConfig({ cwd });
paths = getPaths({ cwd, config });

const app = express();
app.use(require('umi-mock').createMiddleware({
  cwd,
  config,
  absPagesPath: paths.absPagesPath,
  absSrcPath: paths.absSrcPath,
  watch: false,
  onStart({ paths }) {
    registerBabel(paths);
  },
}));
app.use(require('serve-static')('dist'));
app.listen(port, () => {
  console.log(`umi ui listening on port ${port}`);
});

function registerBabel(extraFiles = []) {
  require('@babel/register')({
    presets: [
      [
        require.resolve('babel-preset-umi'),
        { transformRuntime: false },
      ],
    ],
    plugins: paths && [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            '@': paths.absSrcPath,
          },
        },
      ],
    ],
    only: [
        join(cwd, 'config'),
        join(cwd, '.umirc.js'),
      ]
      .concat(extraFiles)
      .map(file => winPath(file)),
    babelrc: false,
    cache: false,
  });
}
