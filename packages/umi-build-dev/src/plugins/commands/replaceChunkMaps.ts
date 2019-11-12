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

  const umiJS = umiChunk.find(chunk => isAssetsType('js', chunk)) || '';
  const umiCSS = umiChunk.find(chunk => isAssetsType('css', chunk)) || '';

  const replaceUmiJS = [/__UMI_SERVER__\.js/g, umiJS];
  const replaceUmiCSS = umiCSS
    ? [/__UMI_SERVER__\.css/g, umiCSS]
    : [/,[^,]*createElement\("link".*?__UMI_SERVER__\.css.*?\)/gs, ''];

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const umiServer = getContent(umiServerPath);

  const result = umiServer.replace(...replaceUmiJS).replace(...replaceUmiCSS);
  writeFileSync(umiServerPath, result, 'utf-8');
};
