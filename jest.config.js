module.exports = {
  // disable css files mock for bundler-webpack's css import tests
  moduleNameMapper: {},
  collectCoverageFrom(memo) {
    return memo.concat([
      '!packages/bundler-webpack/src/getConfig/setPublicPath.ts',
      '!packages/bundler-webpack/src/getConfig/runtimePublicPathEntry.ts',
      '!packages/bundler-webpack/src/webpackHotDevClient/*',
      '!packages/bundler-webpack/src/cli.ts',
      '!packages/umi/src/cli.ts',
      '!packages/umi/src/forkedDev.ts',
      '!packages/umi/src/ServiceWithBuiltIn.ts',
      '!packages/umi/src/utils/fork.ts',
    ]);
  },
};
