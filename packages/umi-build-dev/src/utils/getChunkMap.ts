import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import { normalizeEntry } from '../routes/routesToJSON';

export interface IChunk {
  files: string[];
}

export interface IChunkGroup {
  name?: string;
  chunks?: string[];
}

export interface IDynamicMap {
  [key: string]: string[];
}

export function getDynamicKey(route: any): string {
  return route.preloadKey || route.path || '__404'; // __404 是为了配置路由的情况下的 404 页面
}

export const patchDataWithRoutes = (
  dynamicMap: IDynamicMap,
  routes: any[] = [],
  chunkGroupData: IChunkGroup[],
  parentChunks: string[] = [],
) => {
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
};

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

export const getChunkAssetsMaps = dynamicMaps =>
  Object.entries(dynamicMaps).reduce((prev, curr) => {
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

export const getChunkGroupData = chunkGroups =>
  chunkGroups.map(chunkGroup => {
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
