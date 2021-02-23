module.exports = {
  // disable css files mock for bundler-webpack's css import tests
  moduleNameMapper: {
    // terser-webpack-plugin
    '^webpack$': '@umijs/deps/compiled/webpack',
    '^webpack/lib/Compilation$': '@umijs/deps/compiled/webpack/Compilation',
    '^webpack/lib/RequestShortener$':
      '@umijs/deps/compiled/webpack/RequestShortener',
  },
  transformIgnorePatterns: ['/node_modules/(?!.*@babel)[^/]+?/'],
  collectCoverageFrom(memo) {
    return memo.concat([
      // benchmarks
      '!benchmarks/**/*',
      '!packages/bundler-webpack/src/getConfig/setPublicPath.ts',
      '!packages/bundler-webpack/src/getConfig/runtimePublicPathEntry.ts',
      '!packages/bundler-webpack/src/webpackHotDevClient/*',

      // cli 入口不测
      '!packages/bundler-webpack/src/cli.ts',
      '!packages/umi/src/cli.ts',
      '!packages/umi/src/forkedDev.ts',
      '!packages/umi/src/ServiceWithBuiltIn.ts',
      '!packages/umi/src/utils/fork.ts',
      '!packages/create-app/src/cli.ts',

      // dev 在 fork 出来的子进程下，测不了
      '!packages/preset-built-in/src/plugins/commands/dev/**/*',
    ]);
  },
};
