import { Compiler } from '@umijs/deps/compiled/webpack';

const pluginId = 'ModifyChunkNamePlugin';
class ModifyChunkNamePlugin {
  constructor() {}
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginId, (compilation) => {
      compilation.hooks.afterOptimizeChunkIds.tap(pluginId, (chunks) => {
        for (const chunk of chunks) {
          // @ts-ignore
          chunk.id = 'mf-dep_' + chunk.id;
          chunk.ids = [chunk.id!];
        }
      });
    });
  }
}

export default ModifyChunkNamePlugin;
