import { lodash, logger, winPath } from '@umijs/utils';
import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';
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

  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({
          preload: zod
            .object({
              mode: zod.enum(['script', 'map']).optional(),
            })
            .optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheck(() => {
    if (!api.config.manifest) {
      throw new Error('You must enable manifest to use routePrefetch feature!');
    }

    assert(
      !api.config.routePrefetch.preload || api.pkg.name,
      'You must set name in package.json to use routePrefetch.preload feature!',
    );
  });

  api.addHTMLHeadScripts(() => {
    const { routePrefetch } = api.config;

    if (routePrefetch.preload) {
      return routePrefetch.preload.mode === 'map'
        ? // map mode
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
                join(TEMPLATES_DIR, 'routePrefetch/preloadRouteFilesScp.js'),
                'utf-8',
              )
                .replace(
                  '"{{routeChunkFilesMap}}"',
                  JSON.stringify(routeChunkFilesMap),
                )
                .replace('{{basename}}', api.config.base)
                .replace('{{publicPath}}', api.config.publicPath),
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
      const { chunks = [] } = stats.toJson();

      // collect all chunk files and file chunks indexes
      const chunkFiles: Record<string, { index: number; id: string | number }> =
        {};
      const fileChunksMap: Record<
        string,
        { files: string[]; indexes?: number[] }
      > = {};

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
              `[routePrefetch]: route file resolve error, cannot preload for ${origin.request!}`,
            );
            continue;
          }

          // collect all related chunk files for route file
          while (queue.length) {
            const currentId = queue.shift()!;

            if (!visited.includes(currentId)) {
              const currentChunk = chunks.find((c) => c.id === currentId)!;

              // merge files
              chunk.files!.forEach((file) => {
                chunkFiles[file] ??= {
                  index: Object.keys(chunkFiles).length,
                  id: currentId,
                };
              });

              // merge files
              files.push(...currentChunk.files!);

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
              `[routePrefetch]: route file resolve error, cannot preload for ${current.file}`,
            );
          }
          current = current.parentId && api.appData.routes[current.parentId];
        } while (current);

        const indexes = files.reduce<number[]>((indexes, file) => {
          return indexes.concat(fileChunksMap[file].indexes!);
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

    const manifest = readFileSync(
      join(
        api.paths.absOutputPath,
        api.config.manifest.fileName || 'asset-manifest.json',
      ),
      'utf-8',
    );
    const manifestObj = JSON.parse(manifest);
    const umiJsFileKey = Object.keys(manifestObj).find((key) =>
      key.match(/^umi(.*)\.js$/),
    );
    if (!umiJsFileKey) {
      throw new Error('Cannot find umi.js in manifest.json');
    }

    // manifest has publicPath, but we don't need it in the absOutputPath
    const umiJsFileName = manifestObj[umiJsFileKey].replace(
      new RegExp('^' + api.config.publicPath),
      '',
    );
    const umiJsFile = readFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      'utf-8',
    );

    // TODO: source map will break if we append to the beginning of the file, use https://github.com/Rich-Harris/magic-string to fix this
    const prependJS = `window.__umi_manifest__ = ` + manifest + ';';
    writeFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      prependJS + umiJsFile,
    );
  });
};
