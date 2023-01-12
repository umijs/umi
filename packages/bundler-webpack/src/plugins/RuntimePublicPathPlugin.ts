import type {
  Compiler,
  Compilation,
  RuntimeModule,
} from '@umijs/bundler-webpack/compiled/webpack';

const PLUGIN_NAME = 'RuntimePublicPath';

// ref: https://gist.github.com/ScriptedAlchemy/60d0c49ce049184f6ce3e86ca351fdca
export class RuntimePublicPathPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation: Compilation) => {
      compilation.hooks.runtimeModule.tap(
        PLUGIN_NAME,
        (module: RuntimeModule) => {
          // The hook to get the public path ('__webpack_require__.p')
          // https://github.com/webpack/webpack/blob/master/lib/runtime/PublicPathRuntimeModule.js
          if (module.constructor.name === 'PublicPathRuntimeModule') {
            // If current public path is handled by mini-css-extract-plugin, skip it
            if (
              module
                .getGeneratedCode()
                .includes('webpack:///mini-css-extract-plugin')
            )
              return;
            // @ts-ignore
            module._cachedGeneratedCode = `__webpack_require__.p = (typeof globalThis !== 'undefined' ? globalThis : window).publicPath || '/';`;
          }
        },
      );
    });
  }
}
