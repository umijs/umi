import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import webpack from 'webpack';

export function warnIfExists() {
  const filePath = resolve('webpack.config.js');
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

export function applyWebpackConfig(config) {
  const filePath = resolve('webpack.config.js');
  if (existsSync(filePath)) {
    return require(filePath)(config, {
      // eslint-disable-line
      webpack,
    });
  } else {
    return config;
  }
}
