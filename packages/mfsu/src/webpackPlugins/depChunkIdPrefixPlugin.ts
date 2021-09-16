import { Compiler } from '@umijs/bundler-webpack/compiled/webpack';

const pluginId = 'MFSUDepChunkIdPrefix';

export class DepChunkIdPrefixPlugin {
  constructor() {}
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginId, (compilation) => {
      compilation.hooks.afterOptimizeChunkIds.tap(pluginId, (chunks) => {
        for (const chunk of chunks) {
          chunk.id = 'mf-dep_' + chunk.id;
          chunk.ids = [chunk.id!];
        }
      });
    });
  }
}
