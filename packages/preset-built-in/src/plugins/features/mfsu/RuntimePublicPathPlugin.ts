import { Compiler } from '@umijs/deps/compiled/webpack';
// @ts-ignore
import { RawSource } from '@umijs/deps/compiled/webpack-sources2';
import { MF_VA_PREFIX } from './constants';

export class RuntimePublicPathPlugin {
  constructor() {}
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('RuntimePublicPathPlugin', (compilation) => {
      // @ts-ignore
      compilation.hooks.processAssets.tap('RuntimePublicPathPlugin', () => {
        const s = compilation.getAsset(`${MF_VA_PREFIX}remoteEntry.js`);
        if (s) {
          compilation.updateAsset(`${MF_VA_PREFIX}remoteEntry.js`, () => {
            return new RawSource(
              s.source
                .source()
                .toString()
                .replace(
                  `__webpack_require__.p = "/";`,
                  `__webpack_require__.p = window.publicPath;`,
                ),
            );
          });
        }
      });
    });
  }
}
