import type { Compiler } from '@umijs/bundler-webpack/compiled/webpack';

const PLUGIN_NAME = 'RuntimePublicPath';

export class RuntimePublicPathPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.runtimeModule.tap(PLUGIN_NAME, (module) => {
        // The hook to get the public path ('__webpack_require__.p')
        // https://github.com/webpack/webpack/blob/master/lib/runtime/PublicPathRuntimeModule.js
        if (module.constructor.name === 'PublicPathRuntimeModule') {
          // @ts-ignore
          module._cachedGeneratedCode = `__webpack_require__.p = window.publicPath;`;
        }
      });
    });
  }
}
