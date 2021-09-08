function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  async chainWebpack(webpackConfig: any) {
    await delay(50);
    webpackConfig.resolve.alias.set('react', './react.ts');
    return webpackConfig;
  },
};
