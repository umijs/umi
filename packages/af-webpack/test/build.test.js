import webpack from 'webpack';
import { join } from 'path';
import { existsSync } from 'fs';
import rimraf from 'rimraf';
import getUserConfig from '../src/getUserConfig';
import getConfig from '../src/getConfig';

process.env.NODE_ENV = 'production';
process.env.COMPRESS = 'none';
process.env.__FROM_UMI_TEST = true;

function getEntry(cwd) {
  if (existsSync(join(cwd, 'index.ts'))) {
    return join(cwd, 'index.ts');
  } else {
    return join(cwd, 'index.js');
  }
}

function build(opts, done) {
  const { config: userConfig } = getUserConfig({
    cwd: opts.cwd,
  });
  const webpackConfig = getConfig({
    ...opts,
    ...userConfig,
    babel: {
      presets: [require.resolve('babel-preset-umi')],
    },
    entry: {
      index: getEntry(opts.cwd),
    },
  });
  const outputPath = join(opts.cwd, 'dist');
  rimraf.sync(outputPath);
  webpackConfig.output.path = outputPath;
  webpack(webpackConfig, err => {
    if (err) {
      throw new Error(err);
    } else {
      done();
    }
  });
}

describe('build', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures'),
    build({ cwd, dir }) {
      return new Promise((resolve, reject) => {
        build(
          {
            cwd,
            outputPath: join(cwd, 'dist'),
            disableCSSModules: dir.indexOf('css-modules-exclude') === -1,
          },
          err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
    },
    replaceContent(content) {
      return content.replace(
        /\/\/ EXTERNAL MODULE[^\n]+/g,
        '// $EXTERNAL_MODULE$',
      );
    },
  });
});
