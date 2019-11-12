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

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

const express = require('express');
const compression = require('compression');
const { winPath } = require('umi-utils');
const getUserConfig = require('umi-core/lib/getUserConfig');
const getPaths = require('umi-core/lib/getPaths');
const boxen = require('boxen');
const clipboardy = require('clipboardy');
const os = require('os');
const port = process.env.PORT || 8001;
const cwd = process.cwd();

let paths;

// 获取 config 之前先注册一遍
registerBabel();

const config = getUserConfig.default({ cwd });
paths = getPaths.default({ cwd, config });

const app = express();

// Gzip support
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
      }
      // fallback to standard filter function
      return compression.filter(req, res);
    },
  }),
);

app.use(
  require('umi-mock').createMiddleware({
    cwd,
    config,
    absPagesPath: paths.absPagesPath,
    absSrcPath: paths.absSrcPath,
    watch: false,
    onStart({ paths }) {
      registerBabel(paths);
    },
    onError(e) {
      console.log(e.message);
    },
  }).middleware,
);
app.use(require('serve-static')('dist'));
app.listen(port, () => {
  const ip = getNetworkAddress();
  const localAddress = `http://localhost:${port}`;
  const networkAddress = `http://${ip}:${port}`;
  const message = [
    chalk.green('Serving your umi project!'),
    '',
    `${chalk.bold(`- Local:`)}            ${localAddress}`,
    `${chalk.bold('- On Your Network:')}  ${networkAddress}`,
    '',
    `${chalk.grey('Copied local address to clipboard!')}`,
  ];
  if (process.platform !== `linux` || process.env.DISPLAY) {
    clipboardy.writeSync(localAddress);
  }
  console.log(
    boxen(message.join('\n'), {
      padding: 1,
      borderColor: 'green',
      margin: 1,
    }),
  );
});

function registerBabel(extraFiles = []) {
  require('@babel/register')({
    presets: [
      require.resolve('@babel/preset-typescript'),
      [
        require.resolve('babel-preset-umi'),
        {
          env: { targets: { node: 8 } },
          transformRuntime: false,
        },
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
    only: [join(cwd, 'config'), join(cwd, '.umirc.js')]
      .concat(extraFiles)
      .map(file => winPath(file)),
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    babelrc: false,
    cache: false,
  });
}

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      const { address, family, internal } = interface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
}
