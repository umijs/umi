import { css } from 'docz-plugin-css-temp';
import { join } from 'path';
import {readFileSync} from "fs";

const cssModuleRegex = /\.module\.css$/;
const lessModuleRegex = /\.module\.less$/;

const cwd = process.cwd();
const userConfig = JSON.parse(
  readFileSync(join(cwd, '.docz', '.umirc.library.json'), 'utf-8'),
);

export default {
  ...userConfig.doc,
  modifyBundlerConfig(config, dev, args) {
    if (userConfig.modifyBundlerConfig) {
      config = userConfig.modifyBundlerConfig(config, dev, args);
    }

    // do not generate doc sourcemap
    config.devtool = false;

    // support disable minimize via process.env.COMPRESS
    if (process.env.COMPRESS === 'none') {
      config.optimization.minimize = false;
    }
    return config;
  },
  plugins: [
    ...(userConfig.plugins || []),

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
