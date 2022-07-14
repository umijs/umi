const { relative, basename, resolve } = require('path');
const { Module } = require('module');

const m = new Module(resolve(__dirname, 'bundles', '_'));
m.filename = m.id;
m.paths = Module._nodeModulePaths(m.id);
const bundleRequire = m.require;
bundleRequire.resolve = (request, options) => {
  return Module._resolveFilename(request, m, false, options);
};

const externals = {
  chokidar: 'chokidar',
  clipboardy: 'clipboardy',
  prettier: 'prettier',

  // umi 的 bundle 有问题，会自动包含 react，这部分没必要包含进来
  'react': 'react',
  // @umijs/babel-plugin-import-to-await-require 依赖 @umijs/utils，后续考虑删除依赖
  '@umijs/utils': '@umijs/utils',

  // webpack
  'node-libs-browser': 'node-libs-browser',
  'jest-worker': 'jest-worker',
};

externals['address'] = '@umijs/deps/compiled/address';
export async function ncc_address(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('address'))
    )
    .ncc({ packageName: 'address', externals })
    .target('compiled/address');
}

externals['ansi-html'] = '@umijs/deps/compiled/ansi-html';
export async function ncc_ansi_html(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('ansi-html'))
    )
    .ncc({ packageName: 'ansi-html', externals })
    .target('compiled/ansi-html');
}

export async function ncc_babel_bundle(task, opts) {
  const bundleExternals = { ...externals }
  for (const pkg of Object.keys(babelBundlePackages))
    delete bundleExternals[pkg]
  await task
    .source(opts.src || 'bundles/babel/bundle.js')
    .ncc({
      packageName: '@babel/core',
      bundleName: 'babel',
      externals: bundleExternals,
      minify: false,
    })
    .target('compiled/babel');
}

const babelBundlePackages = {
  '@babel/code-frame': '@umijs/deps/compiled/babel/code-frame',
  '@babel/core': '@umijs/deps/compiled/babel/core',
  '@babel/parser': '@umijs/deps/compiled/babel/parser',
  '@babel/template': '@umijs/deps/compiled/babel/template',
  '@babel/generator': '@umijs/deps/compiled/babel/generator',
  '@babel/register': '@umijs/deps/compiled/babel/register',
  '@babel/traverse': '@umijs/deps/compiled/babel/traverse',
  '@babel/types': '@umijs/deps/compiled/babel/types',
  '@babel/preset-env': '@umijs/deps/compiled/babel/preset-env',
  '@babel/preset-react': '@umijs/deps/compiled/babel/preset-react',
  '@babel/preset-typescript': '@umijs/deps/compiled/babel/preset-typescript',
}

Object.assign(externals, babelBundlePackages);

export async function ncc_babel_bundle_packages(task, opts) {
  await task
    .source(opts.src || 'bundles/babel/packages/*')
    .target('compiled/babel/')
}

externals['body-parser'] = '@umijs/deps/compiled/body-parser';
export async function ncc_body_parser(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('body-parser'))
    )
    .ncc({ packageName: 'body-parser', externals })
    .target('compiled/body-parser');
}

externals['chalk'] = '@umijs/deps/compiled/chalk';
export async function ncc_chalk(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('chalk'))
    )
    .ncc({ packageName: 'chalk', externals })
    .target('compiled/chalk');
}

externals['cacache'] = '@umijs/deps/compiled/cacache';
export async function ncc_cacache(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('cacache'))
    )
    .ncc({ packageName: 'cacache', externals })
    .target('compiled/cacache');
}

externals['cheerio'] = '@umijs/deps/compiled/cheerio';
export async function ncc_cheerio(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('cheerio'))
    )
    .ncc({ packageName: 'cheerio', externals })
    .target('compiled/cheerio');
}

externals['cliui'] = '@umijs/deps/compiled/cliui';
export async function ncc_cliui(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('cliui'))
    )
    .ncc({ packageName: 'cliui', externals })
    .target('compiled/cliui');
}

externals['color'] = '@umijs/deps/compiled/color';
export async function ncc_color(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('color'))
    )
    .ncc({ packageName: 'color', externals })
    .target('compiled/color');
}

externals['copy-webpack-plugin'] = '@umijs/deps/compiled/copy-webpack-plugin';
export async function ncc_copy_webpack_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('copy-webpack-plugin'))
    )
    .ncc({ packageName: 'copy-webpack-plugin', externals })
    .target('compiled/copy-webpack-plugin');
}

externals['crequire'] = '@umijs/deps/compiled/crequire';
export async function ncc_crequire(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('crequire'))
    )
    .ncc({ packageName: 'crequire', externals })
    .target('compiled/crequire');
}

externals['cross-spawn'] = '@umijs/deps/compiled/cross-spawn';
export async function ncc_cross_spawn(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('cross-spawn'))
    )
    .ncc({ packageName: 'cross-spawn', externals })
    .target('compiled/cross-spawn');
}

externals['css-loader'] = '@umijs/deps/compiled/css-loader';
export async function ncc_css_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('css-loader'))
    )
    .ncc({ packageName: 'css-loader', externals })
    .target('compiled/css-loader');
}

externals['css-modules-typescript-loader'] = '@umijs/deps/compiled/css-modules-typescript-loader';
export async function ncc_css_modules_typescript_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('css-modules-typescript-loader'))
    )
    .ncc({ packageName: 'css-modules-typescript-loader', externals })
    .target('compiled/css-modules-typescript-loader');
}

externals['compression'] = '@umijs/deps/compiled/compression';
export async function ncc_compression(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('compression'))
    )
    .ncc({ packageName: 'compression', externals })
    .target('compiled/compression');
}

externals['debug'] = '@umijs/deps/compiled/debug';
export async function ncc_debug(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('debug'))
    )
    .ncc({ packageName: 'debug', externals })
    .target('compiled/debug');
}

externals['deepmerge'] = '@umijs/deps/compiled/deepmerge';
export async function ncc_deepmerge(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('deepmerge'))
    )
    .ncc({ packageName: 'deepmerge', externals })
    .target('compiled/deepmerge');
}

externals['dotenv'] = '@umijs/deps/compiled/dotenv';
export async function ncc_dotenv(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('dotenv'))
    )
    .ncc({ packageName: 'dotenv', externals })
    .target('compiled/dotenv');
}

externals['ejs'] = '@umijs/deps/compiled/ejs';
export async function ncc_ejs(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('ejs'))
    )
    .ncc({ packageName: 'ejs', externals })
    .target('compiled/ejs');
}

externals['error-stack-parser'] = '@umijs/deps/compiled/error-stack-parser';
export async function ncc_error_stack_parser(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('error-stack-parser'))
    )
    .ncc({ packageName: 'error-stack-parser', externals })
    .target('compiled/error-stack-parser');
}

externals['execa'] = '@umijs/deps/compiled/execa';
export async function ncc_execa(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('execa'))
    )
    .ncc({ packageName: 'execa', externals })
    .target('compiled/execa');
}

externals['express'] = '@umijs/deps/compiled/express';
export async function ncc_express(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('express'))
    )
    .ncc({ packageName: 'express', externals })
    .target('compiled/express');
}

externals['file-loader'] = '@umijs/deps/compiled/file-loader';
export async function ncc_file_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('file-loader'))
    )
    .ncc({ packageName: 'file-loader', externals })
    .target('compiled/file-loader');
}

externals['find-cache-dir'] = '@umijs/deps/compiled/find-cache-dir';
export async function ncc_find_cache_dir(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('find-cache-dir'))
    )
    .ncc({ packageName: 'find-cache-dir', externals })
    .target('compiled/find-cache-dir');
}

// externals['fork-ts-checker-webpack-plugin'] = '@umijs/deps/compiled/fork-ts-checker-webpack-plugin';
export async function ncc_fork_ts_checker_webpack_plugin_bundle(task, opts) {
  await task
    .source(opts.src || 'bundles/fork-ts-checker-webpack-plugin/bundle.js')
    .ncc({
      packageName: 'fork-ts-checker-webpack-plugin',
      bundleName: 'fork-ts-checker-webpack-plugin',
      externals: {
        ...externals,
        typescript: 'typescript',
        eslint: 'eslint',
      },
      minify: false,
    })
    .target('compiled/fork-ts-checker-webpack-plugin')

  await task
    .source(
      opts.src || relative(__dirname, require.resolve('fork-ts-checker-webpack-plugin'))
    )
    .ncc({ packageName: 'fork-ts-checker-webpack-plugin', externals })
    .target('compiled/fork-ts-checker-webpack-plugin');
}

export async function ncc_fork_ts_checker_webpack_plugin_bundle_package(task, opts) {
  await task
    .source(opts.src || 'bundles/fork-ts-checker-webpack-plugin/packages/*')
    .target('compiled/fork-ts-checker-webpack-plugin/')
}

externals['friendly-errors-webpack-plugin'] = '@umijs/deps/compiled/friendly-errors-webpack-plugin';
export async function ncc_friendly_errors_webpack_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('friendly-errors-webpack-plugin'))
    )
    .ncc({ packageName: 'friendly-errors-webpack-plugin', externals })
    .target('compiled/friendly-errors-webpack-plugin');
}

externals['glob'] = '@umijs/deps/compiled/glob';
export async function ncc_glob(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('glob'))
    )
    .ncc({ packageName: 'glob', externals })
    .target('compiled/glob');
}

externals['got'] = '@umijs/deps/compiled/got';
export async function ncc_got(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('got'))
    )
    .ncc({ packageName: 'got', externals })
    .target('compiled/got');
}

externals['html-entities'] = '@umijs/deps/compiled/html-entities';
export async function ncc_html_entities(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('html-entities'))
    )
    .ncc({ packageName: 'html-entities', externals })
    .target('compiled/html-entities');
}

externals['http-proxy-middleware'] = '@umijs/deps/compiled/http-proxy-middleware';
export async function ncc_http_proxy_middleware(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('http-proxy-middleware'))
    )
    .ncc({ packageName: 'http-proxy-middleware', externals })
    .target('compiled/http-proxy-middleware');
}

externals['immer'] = '@umijs/deps/compiled/immer';
export async function ncc_immer(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('immer'))
    )
    .ncc({ packageName: 'immer', externals })
    .target('compiled/immer');
}

// don't external
// externals['path-to-regexp'] = '@umijs/deps/compiled/path-to-regexp';
export async function ncc_path_to_regexp(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('path-to-regexp'))
    )
    .ncc({ packageName: 'path-to-regexp', externals })
    .target('compiled/path-to-regexp');
}

externals['prompts'] = '@umijs/deps/compiled/prompts';
export async function ncc_prompts(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('prompts'))
    )
    .ncc({ packageName: 'prompts', externals })
    .target('compiled/prompts');
}

externals['less'] = '@umijs/deps/compiled/less';
export async function ncc_less(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('less'))
    )
    .ncc({ packageName: 'less', externals })
    .target('compiled/less');
}

externals['less-loader'] = '@umijs/deps/compiled/less-loader';
export async function ncc_less_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('less-loader'))
    )
    .ncc({ packageName: 'less-loader', externals })
    .target('compiled/less-loader');
}

// 不 external loader-utils，可能不是同一个版本
// externals['loader-utils'] = '@umijs/deps/compiled/loader-utils';
export async function ncc_loader_utils(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('loader-utils'))
    )
    .ncc({ packageName: 'loader-utils', externals })
    .target('compiled/loader-utils');
}

externals['lodash'] = '@umijs/deps/compiled/lodash';
export async function ncc_lodash(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('lodash'))
    )
    .ncc({ packageName: 'lodash', externals })
    .target('compiled/lodash');
}

externals['merge-stream'] = '@umijs/deps/compiled/merge-stream';
export async function ncc_merge_stream(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('merge-stream'))
    )
    .ncc({ packageName: 'merge-stream', externals })
    .target('compiled/merge-stream');
}

// mkdirp 有多版本问题，暂不做 external，比如 webpack 4 里可能用了 mkdirp 的老版本
// externals['mkdirp'] = '@umijs/deps/compiled/mkdirp';
export async function ncc_mkdirp(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('mkdirp'))
    )
    .ncc({ packageName: 'mkdirp', externals })
    .target('compiled/mkdirp');
}

externals['multer'] = '@umijs/deps/compiled/multer';
export async function ncc_multer(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('multer'))
    )
    .ncc({ packageName: 'multer', externals })
    .target('compiled/multer');
}

externals['mustache'] = '@umijs/deps/compiled/mustache';
export async function ncc_mustache(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('mustache'))
    )
    .ncc({ packageName: 'mustache', externals })
    .target('compiled/mustache');
}

externals['native-url'] = '@umijs/deps/compiled/native-url';
export async function ncc_native_url(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('native-url'))
    )
    .ncc({ packageName: 'native-url', externals })
    .target('compiled/native-url');
}

externals['optimize-css-assets-webpack-plugin'] = '@umijs/deps/compiled/optimize-css-assets-webpack-plugin';
export async function ncc_optimize_css_assets_webpack_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('optimize-css-assets-webpack-plugin'))
    )
    .ncc({ packageName: 'optimize-css-assets-webpack-plugin', externals })
    .target('compiled/optimize-css-assets-webpack-plugin');
}

externals['os-locale'] = '@umijs/deps/compiled/os-locale';
export async function ncc_os_locale(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('os-locale'))
    )
    .ncc({ packageName: 'os-locale', externals })
    .target('compiled/os-locale');
}

externals['p-limit'] = '@umijs/deps/compiled/p-limit';
export async function ncc_p_limit(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('p-limit'))
    )
    .ncc({ packageName: 'p-limit', externals })
    .target('compiled/p-limit');
}

externals['pkg-up'] = '@umijs/deps/compiled/pkg-up';
export async function ncc_pkg_up(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('pkg-up'))
    )
    .ncc({ packageName: 'pkg-up', externals })
    .target('compiled/pkg-up');
}

externals['portfinder'] = '@umijs/deps/compiled/portfinder';
export async function ncc_portfinder(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('portfinder'))
    )
    .ncc({ packageName: 'portfinder', externals })
    .target('compiled/portfinder');
}

externals['raw-loader'] = '@umijs/deps/compiled/raw-loader';
export async function ncc_raw_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('raw-loader'))
    )
    .ncc({ packageName: 'raw-loader', externals })
    .target('compiled/raw-loader');
}

externals['resolve'] = '@umijs/deps/compiled/resolve';
export async function ncc_resolve(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('resolve'))
    )
    .ncc({ packageName: 'resolve', externals })
    .target('compiled/resolve');
}

externals['resolve-cwd'] = '@umijs/deps/compiled/resolve-cwd';
export async function ncc_resolve_cwd(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('resolve-cwd'))
    )
    .ncc({ packageName: 'resolve-cwd', externals })
    .target('compiled/resolve-cwd');
}

externals['rimraf'] = '@umijs/deps/compiled/rimraf';
export async function ncc_rimraf(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('rimraf'))
    )
    .ncc({ packageName: 'rimraf', externals })
    .target('compiled/rimraf');
}

externals['semver'] = '@umijs/deps/compiled/semver';
export async function ncc_semver(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('semver'))
    )
    .ncc({ packageName: 'semver', externals })
    .target('compiled/semver');
}

externals['set-value'] = '@umijs/deps/compiled/set-value';
export async function ncc_set_value(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('set-value'))
    )
    .ncc({ packageName: 'set-value', externals })
    .target('compiled/set-value');
}

externals['signale'] = '@umijs/deps/compiled/signale';
export async function ncc_signale(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('signale'))
    )
    .ncc({ packageName: 'signale', externals })
    .target('compiled/signale');
}

externals['serialize-javascript'] = '@umijs/deps/compiled/serialize-javascript';
export async function ncc_serialize_javascript(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('serialize-javascript'))
    )
    .ncc({ packageName: 'serialize-javascript', externals })
    .target('compiled/serialize-javascript');
}

externals['sockjs'] = '@umijs/deps/compiled/sockjs';
export async function ncc_sockjs(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('sockjs'))
    )
    .ncc({ packageName: 'sockjs', externals })
    .target('compiled/sockjs');
}

// webpack 4 打包时不能 external source-map，应该是用了不同版本
// externals['source-map'] = '@umijs/deps/compiled/source-map';
export async function ncc_source_map(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('source-map'))
    )
    .ncc({ packageName: 'source-map', externals })
    .target('compiled/source-map');
}

externals['spdy'] = '@umijs/deps/compiled/spdy';
export async function ncc_spdy(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('spdy'))
    )
    .ncc({ packageName: 'spdy', externals })
    .target('compiled/spdy');
}

externals['speed-measure-webpack-plugin'] = '@umijs/deps/compiled/speed-measure-webpack-plugin';
export async function ncc_speed_measure_webpack_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('speed-measure-webpack-plugin'))
    )
    .ncc({ packageName: 'speed-measure-webpack-plugin', externals })
    .target('compiled/speed-measure-webpack-plugin');
}

externals['stats-webpack-plugin'] = '@umijs/deps/compiled/stats-webpack-plugin';
export async function ncc_stats_webpack_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('stats-webpack-plugin'))
    )
    .ncc({ packageName: 'stats-webpack-plugin', externals })
    .target('compiled/stats-webpack-plugin');
}

externals['style-loader'] = '@umijs/deps/compiled/style-loader';
export async function ncc_style_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('style-loader'))
    )
    .ncc({ packageName: 'style-loader', externals })
    .target('compiled/style-loader');
}

// do not external!
// externals['tapable'] = '@umijs/deps/compiled/tapable';
export async function ncc_tapable(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('tapable'))
    )
    .ncc({ packageName: 'tapable', externals })
    .target('compiled/tapable');
}

externals['yargs-parser'] = '@umijs/deps/compiled/yargs-parser';
export async function ncc_yargs_parser(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('yargs-parser'))
    )
    .ncc({ packageName: 'yargs-parser', externals })
    .target('compiled/yargs-parser');
}

externals['umi-webpack-bundle-analyzer'] = '@umijs/deps/compiled/umi-webpack-bundle-analyzer';
export async function ncc_umi_webpack_bundle_analyzer(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('umi-webpack-bundle-analyzer'))
    )
    .ncc({ packageName: 'umi-webpack-bundle-analyzer', externals })
    .target('compiled/umi-webpack-bundle-analyzer');
}

externals['url-loader'] = '@umijs/deps/compiled/url-loader';
export async function ncc_url_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('url-loader'))
    )
    .ncc({ packageName: 'url-loader', externals })
    .target('compiled/url-loader');
}

externals['webpack-chain'] = '@umijs/deps/compiled/webpack-chain';
export async function ncc_webpack_chain(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('webpack-chain'))
    )
    .ncc({ packageName: 'webpack-chain', externals })
    .target('compiled/webpack-chain');
}

externals['webpack-dev-middleware'] = '@umijs/deps/compiled/webpack-dev-middleware';
export async function ncc_webpack_dev_middleware(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('webpack-dev-middleware'))
    )
    .ncc({ packageName: 'webpack-dev-middleware', externals })
    .target('compiled/webpack-dev-middleware');
}

externals['webpack-manifest-plugin'] = '@umijs/deps/compiled/webpack-manifest-plugin';
export async function ncc_webpack_manifest_plugin(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('webpack-manifest-plugin'))
    )
    .ncc({ packageName: 'webpack-manifest-plugin', externals })
    .target('compiled/webpack-manifest-plugin');
}

externals['webpackbar'] = '@umijs/deps/compiled/webpackbar';
export async function ncc_webpackbar(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('webpackbar'))
    )
    .ncc({ packageName: 'webpackbar', externals })
    .target('compiled/webpackbar');
}

externals['yargs'] = '@umijs/deps/compiled/yargs';
export async function ncc_yargs(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('yargs'))
    )
    .ncc({ packageName: 'yargs', externals })
    .target('compiled/yargs');
}

externals['zlib'] = '@umijs/deps/compiled/zlib';
export async function ncc_zlib(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('zlib'))
    )
    .ncc({ packageName: 'zlib', externals })
    .target('compiled/zlib');
}

// externals['webpack-sources'] = '@umijs/deps/compiled/webpack-sources';
export async function ncc_webpack_sources(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('webpack-sources'))
    )
    .ncc({ packageName: 'webpack-sources', externals })
    .target('compiled/webpack-sources');
}

// externals['webpack-sources2'] = '@umijs/deps/compiled/webpack-sources2'
export async function ncc_webpack_sources2(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, bundleRequire.resolve('webpack-sources2'))
    )
    .ncc({ packageName: 'webpack-sources2', externals, target: 'es5' })
    .target('compiled/webpack-sources2')
}

externals['webpack'] = '@umijs/deps/compiled/webpack/webpack';

// 更多 webpack 的深度依赖
// Object.assign(externals, require('./bundles/webpack/innerFiles').getExternalsMap());

export async function ncc_webpack_bundle4(task, opts) {
  await task
    .source(opts.src || 'bundles/webpack/bundle4.js')
    .ncc({
      packageName: 'webpack',
      bundleName: 'webpack',
      externals,
      minify: false,
      target: 'es5',
    })
    .target('compiled/webpack/4')
}

export async function ncc_webpack_bundle5(task, opts) {
  await task
    .source(opts.src || 'bundles/webpack/bundle5.js')
    .ncc({
      packageName: 'webpack5',
      bundleName: 'webpack',
      customEmit(path) {
        if (path.endsWith('.runtime.js')) return `'./${basename(path)}'`;
      },
      externals: {
        ...externals,
        'webpack-sources': '@umijs/deps/compiled/webpack-sources2',
      },
      minify: false,
      target: 'es5',
    })
    .target('compiled/webpack/5');
}

export async function ncc_worker_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('worker-loader'))
    )
    .ncc({
      packageName: 'worker-loader',
      externals: {
        ...externals,
        ...require('./bundles/webpack/innerFiles').getExternalsMap()
      },
    })
    .target('compiled/worker-loader');
}

externals['@hapi/joi'] = '@umijs/deps/compiled/@hapi/joi';
export async function ncc_hapi_joi(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('@hapi/joi'))
    )
    .ncc({ packageName: '@hapi/joi', externals })
    .target('compiled/@hapi/joi');
}

externals['joi2types'] = '@umijs/deps/compiled/joi2types';
export async function ncc_joi2types(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('joi2types'))
    )
    .ncc({ packageName: 'joi2types', externals })
    .target('compiled/joi2types');
}

// 放到 webpack 和 @babel/core 后面
externals['babel-loader'] = '@umijs/deps/compiled/babel-loader';
export async function ncc_babel_loader(task, opts) {
  await task
    .source(
      opts.src || relative(__dirname, require.resolve('babel-loader'))
    )
    .ncc({ packageName: 'babel-loader', externals })
    .target('compiled/babel-loader');
}

export async function ncc(task) {
  await task
    .clear('compiled')
    .parallel([
      'ncc_address',
      'ncc_ansi_html',
      'ncc_babel_bundle',
      'ncc_babel_bundle_packages',
      'ncc_body_parser',
      'ncc_cacache',
      'ncc_chalk',
      'ncc_cheerio',
      'ncc_cliui',
      'ncc_color',
      'ncc_copy_webpack_plugin',
      'ncc_crequire',
      'ncc_cross_spawn',
      'ncc_css_loader',
      'ncc_css_modules_typescript_loader',
      'ncc_compression',
      'ncc_debug',
      'ncc_deepmerge',
      'ncc_dotenv',
      'ncc_ejs',
      'ncc_error_stack_parser',
      'ncc_execa',
      'ncc_express',
      'ncc_file_loader',
      'ncc_find_cache_dir',
      'ncc_fork_ts_checker_webpack_plugin_bundle',
      'ncc_fork_ts_checker_webpack_plugin_bundle_package',
      'ncc_friendly_errors_webpack_plugin',
      'ncc_glob',
      'ncc_got',
      'ncc_html_entities',
      'ncc_http_proxy_middleware',
      'ncc_immer',
      'ncc_path_to_regexp',
      'ncc_prompts',
      'ncc_loader_utils',
      'ncc_lodash',
      'ncc_less',
      'ncc_less_loader',
      'ncc_merge_stream',
      'ncc_mkdirp',
      'ncc_multer',
      'ncc_mustache',
      'ncc_native_url',
      'ncc_optimize_css_assets_webpack_plugin',
      'ncc_os_locale',
      'ncc_p_limit',
      'ncc_pkg_up',
      'ncc_portfinder',
      'ncc_raw_loader',
      'ncc_resolve',
      'ncc_resolve_cwd',
      'ncc_rimraf',
      'ncc_semver',
      'ncc_set_value',
      'ncc_signale',
      'ncc_serialize_javascript',
      'ncc_sockjs',
      'ncc_source_map',
      'ncc_spdy',
      'ncc_speed_measure_webpack_plugin',
      'ncc_stats_webpack_plugin',
      'ncc_style_loader',
      'ncc_tapable',
      'ncc_umi_webpack_bundle_analyzer',
      'ncc_url_loader',
      'ncc_webpack_chain',
      'ncc_webpack_dev_middleware', // webpack-dev-middleware
      'ncc_webpack_manifest_plugin', // webpack-manifest-plugin
      'ncc_webpackbar',
      'ncc_yargs_parser',
      'ncc_yargs',
      'ncc_zlib',
      'ncc_webpack_sources',
      'ncc_webpack_sources2',
      'ncc_webpack_bundle4',
      'ncc_webpack_bundle5',
      'ncc_webpack_bundle_packages',
      'ncc_worker_loader',
      'ncc_hapi_joi',
      // depends on @hapi/joi
      'ncc_joi2types',
      'ncc_babel_loader',
    ]);
}

export async function ncc_webpack_bundle_packages(task, opts) {
  await task
    .source(opts.src || 'bundles/webpack/packages/*')
    .target('compiled/webpack/')
}

export default async function (task) {
  await task.clear('dist')
}
