const {
  files,
  getFileName,
} = require('./packages/bundler-webpack/lib/requireHook');

const webpackModuleNameMapper = files.reduce((memo, file) => {
  const fileName = getFileName(file);
  memo[`^${file}$`] = `@umijs/deps/compiled/webpack/${fileName}`;
  return memo;
}, {});

module.exports = {
  // disable css files mock for bundler-webpack's css import tests
  moduleNameMapper: {
    // terser-webpack-plugin
    '^webpack$': '@umijs/deps/compiled/webpack',
    ...webpackModuleNameMapper,
  },
  transformIgnorePatterns: ['/node_modules/(?!.*@babel)[^/]+?/'],
  collectCoverageFrom(memo) {
    return memo.concat([
      // benchmarks
      '!benchmarks/**/*',

      // bundler-webpack
      '!packages/bundler-webpack/src/getConfig/setPublicPath.ts',
      '!packages/bundler-webpack/src/getConfig/runtimePublicPathEntry.ts',
      '!packages/bundler-webpack/src/webpackHotDevClient/*',
      '!packages/bundler-webpack/src/webpack/**/*',
      '!packages/bundler-webpack/src/DevCompileDonePlugin.ts',

      // preset-built-in
      '!packages/preset-built-in/src/plugins/commands/config/*',
      '!packages/preset-built-in/src/plugins/commands/help/*',
      '!packages/preset-built-in/src/plugins/commands/plugin/*',

      // utils
      '!packages/utils/src/cleanRequireCache/cleanRequireCache.ts',
      '!packages/utils/src/ssr/ssr.ts',

      // test-utils
      '!packages/test-utils/src/**/*',

      // cli 入口不测
      '!packages/bundler-webpack/src/cli.ts',
      '!packages/umi/src/cli.ts',
      '!packages/umi/src/forkedDev.ts',
      '!packages/umi/src/ServiceWithBuiltIn.ts',
      '!packages/umi/src/utils/fork.ts',
      '!packages/create-umi-app/src/cli.ts',

      // dev 在 fork 出来的子进程下，测不了
      '!packages/preset-built-in/src/plugins/commands/dev/**/*',
    ]);
  },
};
