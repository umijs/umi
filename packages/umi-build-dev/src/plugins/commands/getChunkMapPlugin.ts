import { IWebpack } from 'umi-types';
import {
  IChunkGroup,
  getChunkGroupData,
  patchDataWithRoutes,
  getChunkAssetsMaps,
} from '../../utils/getChunkMap';

export default service => {
  return class {
    apply(compiler: IWebpack.Compiler) {
      const { routes } = service;
      compiler.hooks.emit.tap('generate-ssr-client-manifest', compilation => {
        const { chunkGroups } = compilation;
        const dynamicMap = {};
        const chunkGroupData: IChunkGroup[] = getChunkGroupData(chunkGroups);
        const { chunks: umiChunk = [] } = chunkGroupData.find(chunk => chunk.name === 'umi') || {};
        console.log('-plugin umiChunk', umiChunk);
        patchDataWithRoutes(dynamicMap, routes, chunkGroupData, umiChunk);
        const chunkAssetsMaps = getChunkAssetsMaps(dynamicMap);
        const content = JSON.stringify(chunkAssetsMaps, null, 2);

        try {
          compilation.assets['ssr-client-mainifest.json'] = {
            source: () => content,
            size: () => content.length,
          };
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    }
  };
};
