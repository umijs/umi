/**
 * NOTE: DO NOT USE ADVANCED SYNTAX IN THIS FILE, TO AVOID INSERT HELPERS TO REDUCE SCRIPT SIZE.
 */

import type { IRouteChunkFilesMap } from './routePreloadOnLoad';

export type { IRouteChunkFilesMap };

export interface IPreloadRouteFile {
  type: 'js' | 'css' | (string & {});
  url: string;
  attrs: ([string, string] | [string])[];
}

export const PRELOAD_ROUTE_MAP_SCP_TYPE = 'umi-route-chunk-files-map';
export const PRELOAD_ROUTE_HELPER = 'preload_helper';

export function getPreloadRouteFiles(
  path: string,
  map: IRouteChunkFilesMap,
  opts: { publicPath: string },
): IPreloadRouteFile[] | undefined {
  const matched: IRouteChunkFilesMap['r'][string] | undefined =
    // search for static route
    map.r[path] ||
    // search for dynamic route
    Object.entries(map.r).find((p) => {
      const route = p[0];
      const reg = new RegExp(
        // replace /:id to /[^/]+
        // replace /* to /.+
        `^${route.replace(/\/:[^/]+/g, '/[^/]+').replace('/*', '/.+')}$`,
      );

      return reg.test(path);
    })?.[1];

  return matched?.map((i) => {
    const id = map.f[i][1];
    const file = map.f[i][0];
    const ext = file.split('.').pop() as IPreloadRouteFile['type'];

    return {
      type: ext,
      url: `${opts.publicPath}${file}`,
      attrs: [[`data-${map.b}`, `${map.p}:${id}`]],
    };
  });
}
