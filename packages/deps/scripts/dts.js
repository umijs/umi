const { Package } = require('dts-packer');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const cwd = process.cwd();

function dts({ name }) {
  console.log(`Generate dts for ${name}`);
  const isBabel = name.startsWith('@babel/');
  const pkgRoot = join(cwd, 'compiled', name);
  const pkg = new Package({
    cwd,
    name: name,
    typesRoot: pkgRoot,
    externals: [
      'express',
      'webpack',
      'webpack-sources',
      'tapable',
      'yargs-parser',
    ],
  });

  if (!isBabel) {
    const pkgJSONPath = join(pkgRoot, 'package.json');
    const pkgJSON = JSON.parse(readFileSync(pkgJSONPath, 'utf-8'));
    pkgJSON.types = pkg.entryFile;
    console.log(`Write types ${pkg.entryFile} to ${pkgJSONPath}`);
    writeFileSync(
      pkgJSONPath,
      `${JSON.stringify(pkgJSON)}\n`,
      'utf-8',
    );
  }
}


// 手动处理的库：
// - joi2types // 不标准的库
// - lodash
// - babel 相关
[
  // babel 相关的先打包，然后再手动处理
  // '@babel/template',
  // '@babel/generator',
  // '@babel/types',
  // '@babel/traverse',
  // '@babel/parser',
  // '@hapi/joi',
  // 'address',
  // 'body-parser',
  // 'chalk',
  // 'cheerio',
  // 'color',
  // 'compression',
  // 'cross-spawn',
  // 'debug',
  // 'deepmerge',
  // 'dotenv',
  // 'ejs',
  // 'execa',
  // 'express',
  // 'glob',
  // 'got',
  // 'http-proxy-middleware',
  // 'immer',
  // 'loader-utils',
  // 'marked',
  // 'marked-terminal',
  // 'merge-stream',
  // 'mkdirp',
  // 'multer',
  // 'mustache',
  // 'os-locale',
  // 'path-to-regexp',
  // 'pkg-up',
  // 'portfinder',
  // 'resolve',
  // 'resolve-cwd',
  // 'rimraf',
  // 'semver',
  // 'serialize-javascript',
  // 'set-value',
  // 'signale',
  // 'sockjs',
  // 'spdy',
  // 'tapable',
  // 'webpack',
  // 'webpack-chain',
  // 'webpack-dev-middleware',
  // 'webpack-sources',
  // 'yargs',
  // 'yargs-parser',
  // 'prompts',
].forEach(name => {
  dts({
    name,
  });
});
