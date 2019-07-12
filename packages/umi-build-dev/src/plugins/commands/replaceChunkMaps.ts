import { join } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { Stats, IApi } from 'umi-types';
import { normalizeEntry } from '../../routes/routesToJSON';
const uniq = require('lodash/uniq');
const flatten = require('lodash/flatten');

export const getServerContent = (umiServerPath: string): string => {
  if (existsSync(umiServerPath)) {
    const content = readFileSync(umiServerPath, 'utf-8');
    return content;
  }
  return '';
};

function getPreloadKey(route: any): string {
  return route.preloadKey || route.path || '__404'; // __404 是为了配置路由的情况下的 404 页面
}

interface IPreloadMap {
  [key: string]: string[];
}

interface IChunkGroup {
  name?: string;
  chunks?: string[];
}

interface IChunk {
  files: string[];
}

function patchDataWithRoutes(
  preloadMap: IPreloadMap,
  routes: any[] = [],
  chunkGroupData: IChunkGroup[],
  parentChunks: string[] = [],
) {
  routes.forEach(route => {
    const key = getPreloadKey(route);
    preloadMap[key] = preloadMap[key] || [];
    const webpackChunkName = normalizeEntry(route.component || 'common_component')
      .replace(/^src__/, '')
      .replace(/^pages__/, 'p__')
      .replace(/^page__/, 'p__');

    const chunks = flatten(
      chunkGroupData.filter(group => group.name === webpackChunkName).map(group => group.chunks),
    );

    preloadMap[key] = uniq(preloadMap[key].concat(parentChunks).concat(chunks));
    patchDataWithRoutes(preloadMap, route.routes, chunkGroupData, preloadMap[key]);
  });
}

export default (service: IApi, clientStat: Stats) => {
  const { paths, routes } = service;
  const { absOutputPath } = paths;

  const { chunkGroups } = clientStat.compilation;
  const preloadMap = {};
  const chunkGroupData: IChunkGroup[] = chunkGroups.map(chunkGroup => {
    return {
      name: chunkGroup.name,
      chunks: flatten(
        chunkGroup.chunks.map((chunk: IChunk) => {
          return chunk.files
            .filter(file => !/(\.map$)|(hot\-update\.js)/.test(file))
            .map(file => {
              return file;
            });
        }),
      ),
    };
  });

  // get umi.js / umi.css
  const { chunks: umiChunk = [] } = chunkGroupData.find(chunk => chunk.name === 'umi') || {};
  // TODO: preloadMap for dynamic chunks
  patchDataWithRoutes(preloadMap, routes, chunkGroupData, umiChunk);

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const umiServer = getServerContent(umiServerPath);
  const result = umiServer
    .replace(/__UMI_SERVER__\.js/g, umiChunk.find(chunk => /\.js$/.test(chunk)) || '')
    .replace(
      /__UMI_SERVER__\.css/g,
      // umi.css may not exist when using dynamic Routing
      umiChunk.find(chunk => /\.css$/.test(chunk)) || '',
    );

  writeFileSync(umiServerPath, result, 'utf-8');
};
