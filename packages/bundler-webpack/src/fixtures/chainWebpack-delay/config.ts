import { delay } from '@umijs/utils';

export default {
  async chainWebpack(webpackConfig: any) {
    await delay(200);
    webpackConfig.resolve.alias.set('react', './react.ts');
    return webpackConfig;
  },
};
