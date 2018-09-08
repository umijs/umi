import webpack from 'webpack';
import rimraf from 'rimraf';
import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { printFileSizesAfterBuild } from 'react-dev-utils/FileSizeReporter';

const debug = require('debug')('af-webpack:build');

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

export default function build(opts = {}) {
  const { webpackConfig, cwd = process.cwd(), onSuccess, onFail } = opts;
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(isPlainObject(webpackConfig), 'webpackConfig should be plain object.');

  debug(
    `Clean output path ${webpackConfig.output.path.replace(`${cwd}/`, '')}`,
  );
  rimraf.sync(webpackConfig.output.path);

  debug('build start');
  webpack(webpackConfig, (err, stats) => {
    debug('build done');

    if (err || stats.hasErrors()) {
      if (onFail) {
        onFail({ err, stats });
      }
      process.exit(1);
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

    if (onSuccess) {
      onSuccess({ stats });
    }
  });
}
