import type { StatsCompilation } from '@umijs/bundler-webpack/compiled/webpack';
import { lodash, logger, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname, isAbsolute, join, relative } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { createResolver } from '../../libs/scan';
import type { IApi, IRoute } from '../../types';
import { PRELOAD_ROUTE_MAP_SCP_TYPE } from './utils';

export interface IRouteChunkFilesMap {
  /**
   * script attr prefix (package.json name)
   */
  p: string;
  /**
   * bundler type
   */
  b: string;
  /**
   * all chunk files
   */
  f: [string, string | number][];
  /**
   * route files index map
   */
  r: Record<string, number[]>;
}

/**
 * forked from: https://github.com/remix-run/react-router/blob/fb0f1f94778f4762989930db209e6a111504aa63/packages/router/utils.ts#L688C1-L719
 */
const routeScoreCache = new Map<string, number>();

function computeRouteScore(path: string): number {
  if (!routeScoreCache.get(path)) {
    const paramRe = /^:[\w-]+$/;
    const dynamicSegmentValue = 3;
    const emptySegmentValue = 1;
    const staticSegmentValue = 10;
    const splatPenalty = -2;
    const isSplat = (s: string) => s === '*';
    let segments = path.split('/');
    let initialScore = segments.length;
    if (segments.some(isSplat)) {
      initialScore += splatPenalty;
    }

    routeScoreCache.set(
      path,
      segments
        .filter((s) => !isSplat(s))
        .reduce(
          (score, segment) =>
            score +
            (paramRe.test(segment)
              ? dynamicSegmentValue
              : segment === ''
              ? emptySegmentValue
              : staticSegmentValue),
          initialScore,
        ),
    );
  }

  return routeScoreCache.get(path)!;
}

export default (api: IApi) => {
  let routeChunkFilesMap: IRouteChunkFilesMap;

  // enable when package name available
  // because preload script use package name as attribute prefix value
  api.describe({
    enableBy: () => Boolean(api.pkg.name),
  });

  api.addHTMLHeadScripts(() => {
    if (api.name === 'build') {
      return api.config.tern
        ? // map mode (for internal tern app)
          [
            {
              type: PRELOAD_ROUTE_MAP_SCP_TYPE,
              content: JSON.stringify(routeChunkFilesMap),
            },
          ]
        : // script mode
          [
            {
              content: readFileSync(
                join(
                  TEMPLATES_DIR,
                  'firstRoutePreload/preloadRouteFilesScp.js',
                ),
                'utf-8',
              )
                .replace(
                  '"{{routeChunkFilesMap}}"',
                  JSON.stringify(routeChunkFilesMap),
                )
                .replace('{{basename}}', api.config.base)
                .replace(
                  '"{{publicPath}}"',
                  `${
                    // handle runtimePublicPath
                    api.config.runtimePublicPath ? 'window.publicPath||' : ''
                  }"${api.config.publicPath}"`,
                ),
            },
          ];
    }

    return [];
  });

  api.onBuildComplete(async ({ err, stats }) => {
    if (!err && !stats.hasErrors()) {
      const routeModulePath = join(api.paths.absTmpPath, 'core/route.tsx');
      const routeModuleName = winPath(relative(api.cwd, routeModulePath));
      const resolver = createResolver({ alias: api.config.alias });
      const { chunks = [] } = stats.toJson
        ? // webpack
          stats.toJson()
        : // mako
          (stats.compilation as unknown as StatsCompilation);

      // collect all chunk files and file chunks indexes
      const chunkFiles: Record<string, { index: number; id: string | number }> =
        {};
      const fileChunksMap: Record<
        string,
        { files: string[]; indexes?: number[] }
      > = {};
      const pickPreloadFiles = (files: string[]) =>
        files.filter((f) => f.endsWith('.js') || f.endsWith('.css'));

      for (const chunk of chunks) {
        const routeOrigins = chunk.origins!.filter((origin) =>
          origin.moduleName?.endsWith(routeModuleName),
        );

        for (const origin of routeOrigins) {
          const queue = [chunk.id!].concat(chunk.siblings!);
          const visited: typeof queue = [];
          const files: string[] = [];
          let fileAbsPath: string;

          // resolve route file path
          try {
            fileAbsPath = await resolver.resolve(
              dirname(routeModulePath),
              origin.request!,
            );
          } catch (err) {
            logger.error(
              `[firstRoutePreload]: route file resolve error, cannot preload for ${origin.request!}`,
            );
            continue;
          }

          // collect all related chunk files for route file
          while (queue.length) {
            const currentId = queue.shift()!;

            if (!visited.includes(currentId)) {
              const currentChunk = chunks.find((c) => c.id === currentId)!;

              // skip sibling entry chunk
              if (currentChunk.entry) continue;

              // merge files
              pickPreloadFiles(chunk.files!).forEach((file) => {
                chunkFiles[file] ??= {
                  index: Object.keys(chunkFiles).length,
                  id: currentId,
                };
              });

              // merge files
              files.push(...pickPreloadFiles(currentChunk.files!));

              // continue to search sibling chunks
              queue.push(...currentChunk.siblings!);

              // mark as visited
              visited.push(currentId);
            }
          }

          fileChunksMap[fileAbsPath] = { files };
        }
      }

      // generate indexes for file chunks
      Object.values(fileChunksMap).forEach((item) => {
        item.indexes = item.files.map((f) => chunkFiles[f].index);
      });

      // generate map for path -> files (include parent route files)
      const routeFilesMap: Record<string, number[]> = {};

      for (const route of Object.values<IRoute>(api.appData.routes)) {
        // skip redirect route
        if (!route.file) continue;

        let current = route;
        const files: string[] = [];

        do {
          // skip inline function route file
          if (!current.file!.startsWith('(')) {
            try {
              const fileReqPath =
                isAbsolute(current.file!) || current.file!.startsWith('@/')
                  ? current.file!
                  : current.file!.replace(/^(\.\/)?/, './');
              const fileAbsPath = await resolver.resolve(
                api.paths.absPagesPath,
                fileReqPath,
              );

              files.push(fileAbsPath);
            } catch {
              logger.error(
                `[firstRoutePreload]: route file resolve error, cannot preload for ${current.file}`,
              );
            }
          }
          current = current.parentId && api.appData.routes[current.parentId];
        } while (current);

        const indexes = files.reduce<number[]>((indexes, file) => {
          // why fileChunksMap[file] may not existing?
          // because Mako will merge minimal async chunk into entry chunk
          // so the merged route chunk does not has to preload
          return indexes.concat(fileChunksMap[file]?.indexes || []);
        }, []);

        routeFilesMap[route.absPath] =
          // why different route may has same absPath?
          // because umi implement route.wrappers via nested routes way, the wrapper route will has same absPath with the nested route
          // so we always select the longest file indexes for the nested route
          !routeFilesMap[route.absPath] ||
          routeFilesMap[route.absPath].length < indexes.length
            ? indexes
            : routeFilesMap[route.absPath];
      }

      routeChunkFilesMap = {
        p: api.pkg.name!,
        b: api.appData.bundler!,
        f: Object.entries(chunkFiles).map(([k, { id }]) => [k, id]),
        // sort similar to react-router@6
        r: lodash(routeFilesMap)
          .toPairs()
          .sort(
            ([a]: [string, number[]], [b]: [string, number[]]) =>
              computeRouteScore(a) - computeRouteScore(b),
          )
          .fromPairs()
          .value() as any,
      };
    }
  });
};
