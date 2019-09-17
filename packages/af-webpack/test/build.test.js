import webpack from 'webpack';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import rimraf from 'rimraf';
import getUserConfig from '../src/getUserConfig';
import getConfig from '../src/getWebpackConfig';

process.env.NODE_ENV = 'production';
process.env.COMPRESS = 'none';
process.env.__FROM_UMI_TEST = true;

/**
 * af-webpack中没有依赖 umi-utils
 * 先不使用 utils 里的方法
 */
const winEOL = content => {
  if (typeof content !== 'string') {
    return content;
  }
  return (
    content
      // 删除 win 换行符
      .replace(/\r/g, '')
      // 删除字符串 win 换行符
      .replace(/\\r/g, '')
      //loc 可能有问题，替换他为空
      .replace(/\"loc\":\{(.*)\}/g, 'loc":{}')
  );
};

function getEntry(cwd) {
  if (existsSync(join(cwd, 'index.ts'))) {
    return join(cwd, 'index.ts');
  } else if (existsSync(join(cwd, 'index.jsx'))) {
    return join(cwd, 'index.jsx');
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

function ssrBuild(opts, done) {
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

  const ssrWebpackConfig = cloneDeep(webpackConfig);
  ssrWebpackConfig.output.libraryTarget = 'commonjs2';
  ssrWebpackConfig.output.filename = '[name].server.js';
  ssrWebpackConfig.output.chunkFilename = '[name].server.async.js';

  webpack([webpackConfig, ssrWebpackConfig], err => {
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
            disableCSSModules: !dir.includes('css-modules-exclude'),
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
      return winEOL(content.replace(/\/\/ EXTERNAL MODULE[^\n]+/g, '// $EXTERNAL_MODULE$'));
    },
  });
});

describe('analyze report', () => {
  beforeAll(() => {
    process.env.ANALYZE_REPORT = true;
  });

  afterAll(() => {
    process.env.ANALYZE_REPORT = false;
  });

  it('should generate analyze report file', done => {
    const root = join(__dirname, './fixtures/typescript');
    build(
      {
        cwd: root,
        outputPath: join(root, 'dist'),
      },
      err => {
        if (err) {
          done(err);
        }
        const statsFile = join(process.cwd(), 'bundlestats.json');
        expect(existsSync(statsFile)).toBeTruthy();
        rimraf.sync(statsFile);
        done();
      },
    );
  });
});

describe('ssr build', () => {
  it('should generate commonjs', done => {
    const root = join(__dirname, './fixtures_ssr');
    ssrBuild(
      {
        cwd: root,
        outputPath: join(root, 'dist'),
      },
      err => {
        if (err) {
          done(err);
        }
        const clientJS = join(root, 'dist', 'index.js');
        const serverJS = join(root, 'dist', 'index.server.js');
        expect(existsSync(clientJS)).toBeTruthy();
        expect(existsSync(serverJS)).toBeTruthy();
        expect(readFileSync(serverJS, 'utf-8')).toMatch(/module\.exports/);
        rimraf.sync(clientJS);
        rimraf.sync(serverJS);
        done();
      },
    );
  });
});
