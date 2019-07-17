import { join } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { IWebpack, IApi } from 'umi-types';
import { IChunkGroup, getChunkGroupData, isAssetsType } from '../../utils/getChunkMap';

export const getContent = (path: string): string => {
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    return content;
  }
  return '';
};

export default (service: IApi, clientStat: IWebpack.Stats) => {
  const { paths } = service;
  const { absOutputPath } = paths;

  const { chunkGroups } = clientStat.compilation;
  const chunkGroupData: IChunkGroup[] = getChunkGroupData(chunkGroups);
  // get umi.js / umi.css
  const { chunks: umiChunk = [] } = chunkGroupData.find(chunk => chunk.name === 'umi') || {};

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const umiServer = getContent(umiServerPath);
  const result = umiServer
    .replace(/__UMI_SERVER__\.js/g, umiChunk.find(chunk => isAssetsType('js', chunk)) || '')
    .replace(
      /__UMI_SERVER__\.css/g,
      // umi.css may not exist when using dynamic Routing
      umiChunk.find(chunk => isAssetsType('css', chunk)) || '',
    );
  writeFileSync(umiServerPath, result, 'utf-8');
};
