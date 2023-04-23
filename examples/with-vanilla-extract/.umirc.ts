import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';

export default {
  chainWebpack(config) {
    config.plugin('vanilla-extract').use(VanillaExtractPlugin, []);

    config.module
      .rule('jsx-ts-tsx')
      .use('babel-loader')
      .tap((opts) => {
        opts.plugins ??= [];
        opts.plugins.unshift('@vanilla-extract/babel-plugin');
        return opts;
      });

    return config;
  },
  mfsu: false,
};
