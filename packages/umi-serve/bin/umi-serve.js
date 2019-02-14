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
const cwd = process.cwd();
const absPagesPath = join(cwd, 'src', 'pages');
const absSrcPath = join(cwd, 'src');
const port = 8001;

const app = express();
app.use(require('umi-mock').createMiddleware({
  cwd,
  config: {},
  absPagesPath,
  absSrcPath,
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
  const only = [
    join(cwd, 'config'),
    join(cwd, '.umirc.js'),
  ]
    .concat(extraFiles)
    .map(file => winPath(file));
  require('@babel/register')({
    presets: [
      [
        require.resolve('babel-preset-umi'),
        { transformRuntime: false },
      ],
    ],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            '@': absSrcPath,
          },
        },
      ],
    ],
    only,
    babelrc: false,
    cache: false,
  });
}
