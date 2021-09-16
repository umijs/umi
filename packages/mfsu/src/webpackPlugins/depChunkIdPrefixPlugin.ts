import { Compiler } from 'webpack';
import { MF_DEP_PREFIX } from '../constants';

const pluginId = 'MFSUDepChunkIdPrefix';

export class DepChunkIdPrefixPlugin {
  constructor() {}
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginId, (compilation) => {
      compilation.hooks.afterOptimizeChunkIds.tap(pluginId, (chunks) => {
        for (const chunk of chunks) {
          chunk.id = MF_DEP_PREFIX + chunk.id;
          chunk.ids = [chunk.id!];
        }
      });
    });
  }
}
