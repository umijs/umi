import { css } from 'docz-plugin-css-temp';

const cssModuleRegex = /\.module\.css$/;
const lessModuleRegex = /\.module\.less$/;

export default {
  hashRouter: true,
  modifyBundlerConfig(config, dev, args) {
    // do not generate doc sourcemap
    config.devtool = false;

    // support disable minimize via process.env.COMPRESS
    if (process.env.COMPRESS === 'none') {
      config.optimization.minimize = false;
    }
    return config;
  },
  plugins: [
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
