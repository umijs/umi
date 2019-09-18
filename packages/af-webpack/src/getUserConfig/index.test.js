import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import getUserConfig from './index';

const fixtures = join(__dirname, 'fixtures');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('rc file', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'rc-file'),
  });
  expect(config).toEqual({
    publicPath: '/foo/',
  });
});

test('js file', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'js-file'),
  });
  expect(config).toEqual({
    publicPath: '/foo/',
  });
});

test('js file in cjs', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'js-file-cjs'),
  });
  expect(config).toEqual({
    publicPath: '/foo/',
  });
});

test('js file with opts.preprocessor', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'js-file'),
    preprocessor: config => {
      return {
        ...config,
        devServer: {},
      };
    },
  });
  expect(config).toEqual({
    publicPath: '/foo/',
    devServer: {},
  });
});

test('js file with opts.disableConfigs', () => {
  expect(() => {
    getUserConfig({
      cwd: join(fixtures, 'js-file'),
      disabledConfigs: ['publicPath'],
    });
  }).toThrow(/publicPath/);
});

test('config item not valid and opts.setConfig', () => {
  let _config = null;
  expect(() => {
    getUserConfig({
      cwd: join(fixtures, 'config-item-not-valid'),
      setConfig(config) {
        _config = config;
      },
    });
  }).toThrow(/Configuration item publicPat is not valid/);
  expect(_config).toEqual({
    publicPat: '/foo/',
  });
});

test('validate publicPath', () => {
  expect(() => {
    getUserConfig({
      cwd: join(fixtures, 'validate-publicPath'),
    });
  }).toThrow(/The publicPath config must ends with \//);
});

test('repalce npm variables', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'replace-npm-variables'),
  });
  expect(config).toEqual({
    publicPath: '/foo/bar/0.1.0/',
    hash: true,
  });
});

test('env', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'env'),
  });
  expect(config).toEqual({
    publicPath: '/bar/',
    alias: {
      a: 'a',
      b: 'b',
    },
    copy: ['a', 'b'],
  });
});

test('env unmatch', () => {
  const { config } = getUserConfig({
    cwd: join(fixtures, 'env-unmatch'),
  });
  expect(config).toEqual({
    publicPath: '/foo/',
  });
});

test('watch', async () => {
  const { config, watch } = getUserConfig({
    cwd: join(fixtures, 'watch'),
  });
  expect(config).toEqual({
    publicPath: '/foo/',
  });
  const rcFile = join(fixtures, 'watch', '.webpackrc.js');
  const originContent = readFileSync(rcFile, 'utf-8');
  const watcher = watch(null, {});
  writeFileSync(rcFile, `export default { publicPath: '/bar/' }`, 'utf-8');
  await delay(500);
  watcher.close();
  await delay(500);
  writeFileSync(rcFile, originContent, 'utf-8');
});
