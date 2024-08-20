import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from 'umi';
import { addAssetRules } from './assetRules';

export function getConfig(config: Config, api: IApi) {
  config.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

  // https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
  config.module
    .rule('esm')
    .test(/\.m?jsx?$/)
    .resolve.set('fullySpecified', false);

  config.resolve.extensions.merge(['.vue']).end();

  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader(require.resolve('vue-loader'))
    .options({
      babelParserPlugins: ['jsx', 'classProperties', 'decorators-legacy'],
    });

  const VueLoaderPlugin = require('vue-loader/dist/pluginWebpack5');

  config.plugin('vue-loader-plugin').use(VueLoaderPlugin.default);

  // https://github.com/vuejs/vue-loader/issues/1435#issuecomment-869074949
  config.module
    .rule('vue-style')
    .test(/\.vue$/)
    .resourceQuery(/type=style/)
    .sideEffects(true);

  // 兼容 element-ui plus
  config.module
    .rule('fix-element-ui-plus')
    .test(/\.mjs$/)
    .include.add(/node_modules/)
    .end()
    .type('javascript/auto')
    .resolve.fullySpecified(false);

  // asset
  addAssetRules({ api, config });
}
