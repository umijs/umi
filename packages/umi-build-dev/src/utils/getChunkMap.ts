import { IRoute } from 'umi-types';
import { uniq, flatten } from 'lodash';
import { normalizeEntry } from '../routes/routesToJSON';

export interface IChunk {
  files: string[];
}

export interface IChunkGroup {
  name?: string;
  chunks?: any[];
}

export interface IChunkAssets {
  /** js chunks */
  js?: string[];
  /** css chunks */
  css?: string[];
  /** other chunks */
  [key: string]: string[];
}

export interface IDynamicMap {
  [key: string]: string[];
}

export interface IDynamicMapAssets {
  [key: string]: IChunkAssets;
}

type IPatchDataWithRoutes = (
  dynamicMap: IDynamicMap,
  /** routes info */
  routes: IRoute[],
  chunkGroupData: IChunkGroup[],
  /** chunks will insert into every route */
  parentChunks?: string[],
) => void;

export function getDynamicKey(route: IRoute): string {
  return route.path || '__404'; // __404 是为了配置路由的情况下的 404 页面
}

/**
 * Patch chunkMap static resources according to routes
 *  {} => { '/': ['.css', '.js', ...], '/bar': ['.js', '.css'] }
 * @param dynamicMap
 * @param routes
 * @param chunkGroupData
 * @param parentChunks
 */
export const patchDataWithRoutes: IPatchDataWithRoutes = (
  dynamicMap,
  routes = [],
  chunkGroupData,
  parentChunks = [],
) => {
  routes.forEach(route => {
    const key = getDynamicKey(route);
    dynamicMap[key] = dynamicMap[key] || [];
    const webpackChunkName = normalizeEntry(route.component || 'common_component')
      .replace(/^src__/, '')
      .replace(/^pages__/, 'p__')
      .replace(/^page__/, 'p__')
      .replace(/\$/g, '_');

    const chunks = flatten(
      chunkGroupData
        .filter(group => group.name === webpackChunkName || group.name === 'umi')
        .map(group => group.chunks),
    );
    dynamicMap[key] = uniq(dynamicMap[key].concat(parentChunks).concat(chunks));
    patchDataWithRoutes(dynamicMap, route.routes, chunkGroupData, dynamicMap[key]);
  });
};

/**
 * is current assets Type?
 * @param type
 * @param filename
 */
export const isAssetsType = (type: RegExp | 'js' | 'css', filename: string): boolean => {
  // for type convert
  const regexpMap = {
    js: /\.js$/,
    css: /\.css$/,
  };
  const expType = typeof type === 'string' ? regexpMap[type] : type;

  if (!expType) {
    return false;
  }
  return expType.test(filename);
};

/**
 * classify assets type
 *  { '/': ['.css', '.js'] } => { '/': js: [], css: [] }
 * @param dynamicMaps
 */
export const getChunkAssetsMaps = (dynamicMaps: IDynamicMap): IDynamicMapAssets =>
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

/**
 * make route chunks into group
 * chunks => [{ name: 'umi', chunks: ['.css', '.js']* }, { name: 'p_bar', chunks: ['.css', '.js'] }]
 * @param chunkGroups
 */
export const getChunkGroupData = (chunkGroups: IChunkGroup[]): IChunkGroup[] =>
  chunkGroups.map(chunkGroup => {
    return {
      name: chunkGroup.name,
      chunks: flatten(
        chunkGroup.chunks.map(chunk => {
          return chunk.files
            .filter(file => !/(\.map$)|(hot\-update\.js)/.test(file))
            .map(file => file);
        }),
      ),
    };
  });
