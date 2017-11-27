import webpack from 'webpack';
import chalk from 'chalk';
import { sync as rimraf } from 'rimraf';
import assert from 'assert';
import isPlainObject from 'is-plain-object';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import printBuildError from 'react-dev-utils/printBuildError';
import { printFileSizesAfterBuild } from 'react-dev-utils/FileSizeReporter';
import { warnIfExists as warnIfWebpackConfigExists } from './applyWebpackConfig';

const debug = require('debug')('af-webpack:build');

process.env.NODE_ENV = 'production';

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

function buildWebpack(webpackConfig) {
  debug(
    `Clean output path ${webpackConfig.output.path.replace(
      `${process.cwd()}/`,
      '',
    )}`,
  );
  rimraf(webpackConfig.output.path);

  const compiler = webpack(webpackConfig);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }

      return resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

export default function build({ webpackConfig, success }) {
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(isPlainObject(webpackConfig), 'webpackConfig should be plain object.');

  // 存在 webpack.config.js 时提醒用户
  warnIfWebpackConfigExists();

  buildWebpack(webpackConfig)
    .then(({ stats, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        {
          root: webpackConfig.output.path,
          sizes: {},
        },
        webpackConfig.output.path,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE,
      );
      console.log();

      if (success) {
        success({ stats, warnings });
      }
    })
    .catch(err => {
      console.log(chalk.red('Failed to compile.\n'));
      printBuildError(err);
      process.exit(1);
    });
}
