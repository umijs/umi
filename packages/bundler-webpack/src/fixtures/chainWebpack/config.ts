export default {
  chainWebpack(webpackConfig: any) {
    webpackConfig.resolve.alias.set('react', './react.ts');
    return webpackConfig;
  },
};
