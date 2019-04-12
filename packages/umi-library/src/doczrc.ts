import { css } from 'docz-plugin-umi-css';
import { join, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { merge } from 'lodash';
import getUserConfig from './getUserConfig';
import reactExternal from './docz-plugin-react-externals';

const cssModuleRegex = /\.module\.css$/;
const lessModuleRegex = /\.module\.less$/;

const cwd = process.cwd();
const localUserConfig = JSON.parse(
  readFileSync(join(cwd, '.docz', '.umirc.library.json'), 'utf-8'),
);
const userConfig = {
  ...localUserConfig,
  // get user config directly from .umirc.library.js
  ...getUserConfig({ cwd }),
};
if (!userConfig.doc) {
  userConfig.doc = merge(userConfig.doc || {});
}

const isTypescript = existsSync(join(cwd, 'tsconfig.json'));

export default {
  typescript: isTypescript,
  repository: false,
  theme: require.resolve('docz-theme-umi'),
  ...userConfig.doc,
  modifyBabelRc(babelrc, args) {
    if (typeof userConfig.doc.modifyBabelRc === 'function') {
      babelrc = userConfig.doc.modifyBabelRc(babelrc, args);
    }

    // 需放 class-properties 前面
    babelrc.plugins.unshift([
      require.resolve('@babel/plugin-proposal-decorators'),
      { legacy: true },
    ]);

    // Support extraBabelPresets and extraBabelPlugins
    babelrc.presets = [
      ...babelrc.presets,
      ...(userConfig.extraBabelPresets || []),
    ];
    babelrc.plugins = [
      ...babelrc.plugins,
      ...(userConfig.extraBabelPlugins || []),
    ];

    return babelrc;
  },
  modifyBundlerConfig(config, dev, args) {
    if (userConfig.doc.modifyBundlerConfig) {
      config = userConfig.doc.modifyBundlerConfig(config, dev, args);
    }

    if (!dev) {
      // do not generate doc sourcemap
      config.devtool = false;

      // support disable minimize via process.env.COMPRESS
      if (process.env.COMPRESS === 'none') {
        config.optimization.minimize = false;
      }
    }

    // 确保只有一个版本的 docz，否则 theme 会出错，因为 ComponentProvider 的 context 不是同一个
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias.docz = dirname(require.resolve('docz/package.json'));

    // 透传 BIGFISH_VERSION 环境变量
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env.BIGFISH_VERSION': JSON.stringify(
          process.env.BIGFISH_VERSION,
        ),
      }),
    );

    // fallback resolve 路径
    config.resolve.modules.push(join(__dirname, '../node_modules'));
    config.resolveLoader.modules.push(join(__dirname, '../node_modules'));

    return config;
  },
  plugins: [
    ...(userConfig.doc.plugins || []),
    reactExternal(),
    ...(userConfig.cssModules
      ? [
          // .css
          css({
            preprocessor: 'postcss',
            ruleOpts: {
              exclude: /node_modules\/.*\.css$/,
            },
            cssmodules: true,
          }),
          css({
            preprocessor: 'postcss',
            ruleOpts: {
              test: /node_modules\/.*\.css$/,
            },
            cssmodules: false,
          }),

          // .less
          css({
            preprocessor: 'less',
            ruleOpts: {
              exclude: /node_modules\/.*\.less$/,
            },
            cssmodules: true,
            loaderOpts: {
              javascriptEnabled: true,
            },
          }),
          css({
            preprocessor: 'less',
            ruleOpts: {
              test: /node_modules\/.*\.less$/,
            },
            cssmodules: false,
            loaderOpts: {
              javascriptEnabled: true,
            },
          }),
        ]
      : [
          // .css
          css({
            preprocessor: 'postcss',
            ruleOpts: {
              exclude: cssModuleRegex,
            },
            cssmodules: false,
          }),
          css({
            preprocessor: 'postcss',
            ruleOpts: {
              test: cssModuleRegex,
            },
            cssmodules: true,
          }),

          // .less
          css({
            preprocessor: 'less',
            ruleOpts: {
              exclude: lessModuleRegex,
            },
            cssmodules: false,
            loaderOpts: {
              javascriptEnabled: true,
            },
          }),
          css({
            preprocessor: 'less',
            ruleOpts: {
              test: lessModuleRegex,
            },
            cssmodules: true,
            loaderOpts: {
              javascriptEnabled: true,
            },
          }),
        ]),
  ],
};
