import { css } from 'docz-plugin-umi-css';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { merge } from 'lodash';
import getUserConfig from './getUserConfig';

const cssModuleRegex = /\.module\.css$/;
const lessModuleRegex = /\.module\.less$/;

const cwd = process.cwd();
// get user config directly from .umirc.library.js
const userConfig = getUserConfig({ cwd });
userConfig.doc = merge(userConfig.doc || {});

const isTypescript = existsSync(join(cwd, 'tsconfig.json'));

export default {
  typescript: isTypescript,
  ...userConfig.doc,
  modifyBabelRc(babelrc, args) {
    if (typeof userConfig.modifyBabelRc === 'function') {
      babelrc = userConfig.modifyBabelRc(babelrc, args);
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
    if (userConfig.modifyBundlerConfig) {
      config = userConfig.modifyBundlerConfig(config, dev, args);
    }

    // do not generate doc sourcemap
    config.devtool = false;
    config.resolve.modules.push(join(__dirname, '../node_modules'));
    config.resolveLoader.modules.push(join(__dirname, '../node_modules'));

    // support disable minimize via process.env.COMPRESS
    if (process.env.COMPRESS === 'none') {
      config.optimization.minimize = false;
    }
    return config;
  },
  plugins: [
    ...(userConfig.doc.plugins || []),

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
  ],
};
