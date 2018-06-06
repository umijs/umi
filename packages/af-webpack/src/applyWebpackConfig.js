import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import webpack from 'webpack';

export function warnIfExists(cwd) {
  const filePath = join(cwd, 'webpack.config.js');
  if (existsSync(filePath)) {
    console.log(
      chalk.yellow(
        `⚠️ ⚠️ ⚠️  It\\'s not recommended to use ${chalk.bold(
          'webpack.config.js',
        )}, since it\\'s major or minor version upgrades may result in incompatibility. If you insist on doing so, please be careful of the compatibility after upgrading.`,
      ),
    );
    console.log();
  }
}

export function applyWebpackConfig(cwd, config) {
  const filePath = join(cwd, 'webpack.config.js');
  if (existsSync(filePath)) {
    let customConfigFn = require(filePath); // eslint-disable-line
    if (customConfigFn.default) {
      customConfigFn = customConfigFn.default;
    }
    return customConfigFn(config, {
      // eslint-disable-line
      webpack,
    });
  } else {
    return config;
  }
}
