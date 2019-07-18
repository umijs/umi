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

function getDynamicKey(route: any): string {
  return route.preloadKey || route.path || '__404'; // __404 是为了配置路由的情况下的 404 页面
}

export const isAssetsType = (type: 'js' | 'css', filename: string): boolean => {
  const regexpMap = {
    js: /\.js$/,
    css: /\.css$/,
  };
  const expType = regexpMap[type];
  if (!expType) {
    return false;
  }
  return expType.test(filename);
};

interface IDynamicMap {
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
  dynamicMap: IDynamicMap,
  routes: any[] = [],
  chunkGroupData: IChunkGroup[],
  parentChunks: string[] = [],
) {
  routes.forEach(route => {
    const key = getDynamicKey(route);
    dynamicMap[key] = dynamicMap[key] || [];
    const webpackChunkName = normalizeEntry(route.component || 'common_component')
      .replace(/^src__/, '')
      .replace(/^pages__/, 'p__')
      .replace(/^page__/, 'p__');

    const chunks = flatten(
      chunkGroupData.filter(group => group.name === webpackChunkName).map(group => group.chunks),
    );

    dynamicMap[key] = uniq(dynamicMap[key].concat(parentChunks).concat(chunks));
    patchDataWithRoutes(dynamicMap, route.routes, chunkGroupData, dynamicMap[key]);
  });
}

export default (service: IApi, clientStat: Stats) => {
  const { paths, routes } = service;
  const { absOutputPath } = paths;

  const { chunkGroups } = clientStat.compilation;
  const dynamicMap = {};
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
  console.log('-umiChunk', umiChunk);
  // TODO: dynamicMap for dynamic chunks
  patchDataWithRoutes(dynamicMap, routes, chunkGroupData, umiChunk);

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const ssrManifestPath = join(absOutputPath, 'ssr-client-mainifest.json');
  const umiServer = getServerContent(umiServerPath);
  const result = umiServer
    .replace(/__UMI_SERVER__\.js/g, umiChunk.find(chunk => isAssetsType('js', chunk)) || '')
    .replace(
      /__UMI_SERVER__\.css/g,
      // umi.css may not exist when using dynamic Routing
      umiChunk.find(chunk => isAssetsType('css', chunk)) || '',
    );

  // transform
  // { '/': [.js, .css] } => { '/': { js: [], css: [] } }
  const chunkAssetsMaps = Object.entries(dynamicMap).reduce((prev, curr) => {
    const [route, chunks] = curr;
    if (route) {
      prev[route] = chunks.reduce(
        (prevChunk, currChunk) => {
          if (isAssetsType('js', currChunk)) {
            prevChunk.js.push(currChunk);
          }
          if (isAssetsType('css', currChunk)) {
            prevChunk.css.push(currChunk);
          }
          return prevChunk;
        },
        { js: [], css: [] },
      );
    }
    return prev;
  }, {});
  console.log('chunkAssetsMaps', chunkAssetsMaps);
  writeFileSync(umiServerPath, result, 'utf-8');
  // write ssr-client-mainifest.json
  writeFileSync(ssrManifestPath, JSON.stringify(chunkAssetsMaps, null, 2));
};
