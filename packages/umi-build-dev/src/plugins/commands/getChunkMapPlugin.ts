import { IWebpack, IApi } from 'umi-types';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import {
  IChunkGroup,
  getChunkGroupData,
  patchDataWithRoutes,
  getChunkAssetsMaps,
} from '../../utils/getChunkMap';

export default (service: IApi) => {
  const isDev = process.env.NODE_ENV === 'development';
  return class {
    apply(compiler: IWebpack.Compiler) {
      compiler.hooks.emit.tap('generate-ssr-client-manifest', compilation => {
        const { routes, config } = service;
        const {
          chunkGroups,
          compiler: {
            options: {
              output: { path: outputPath },
            },
          },
        } = compilation;
        const manifestFileName =
          typeof config.ssr === 'object' && config.ssr.manifestFileName
            ? config.ssr.manifestFileName
            : 'ssr-client-mainifest.json';
        const dynamicMap = {};
        const chunkGroupData: IChunkGroup[] = getChunkGroupData(chunkGroups);
        patchDataWithRoutes(dynamicMap, routes, chunkGroupData);
        const chunkAssetsMaps = getChunkAssetsMaps(dynamicMap);
        const content = JSON.stringify(chunkAssetsMaps, null, 2);

        try {
          compilation.assets[manifestFileName] = {
            source: () => content,
            size: () => content.length,
          };
        } catch (e) {
          compilation.errors.push(e);
        }

        if (isDev) {
          writeFileSync(resolve(outputPath, manifestFileName), content);
        }
      });
    }
  };
};
