import type {
  StatsChunk,
  StatsCompilation,
} from '@umijs/bundler-webpack/compiled/webpack';
import { lodash, logger, winPath } from '@umijs/utils';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, relative } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { createResolver } from '../../libs/scan';
import type { IApi, IRoute } from '../../types';
import { PRELOAD_ROUTE_HELPER, PRELOAD_ROUTE_MAP_SCP_TYPE } from './utils';

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

async function getRouteChunkFilesMap(
  chunks: StatsChunk[],
  opts: {
    resolver: ReturnType<typeof createResolver>;
    routeModuleName: string;
    routeModulePath: string;
  },
) {
  const { resolver, routeModuleName, routeModulePath } = opts;
  const routeChunkFiles: Record<
    string,
    { index: number; id: string | number }
  > = {};
  const routeFileChunksMap: Record<
    string,
    { files: string[]; indexes?: number[] }
  > = {};
  const pickPreloadFiles = (files: string[]) =>
    files.filter((f) => f.endsWith('.js') || f.endsWith('.css'));
  const routeFileResolveCache: Record<string, string> = {};

  for (const chunk of chunks) {
    // skip entry chunk
    if (chunk.entry) continue;

    // pick js and css files
    const pickedFiles = pickPreloadFiles(chunk.files!);
    const routeOrigins = chunk.origins!.filter((origin) =>
      origin.moduleName?.endsWith(routeModuleName),
    );

    for (const origin of routeOrigins) {
      let fileAbsPath: string;

      // resolve route file path
      try {
        fileAbsPath = routeFileResolveCache[origin.request!] ??=
          await resolver.resolve(dirname(routeModulePath), origin.request!);
      } catch (err) {
        logger.error(
          `[routePreloadOnLoad]: route file resolve error, cannot preload for ${origin.request!}`,
        );
        continue;
      }

      // save visit index and chunk id for each chunk file
      pickedFiles.forEach((file) => {
        routeChunkFiles[file] ??= {
          index: Object.keys(routeChunkFiles).length,
          id: chunk.id!,
        };
      });

      // merge all related chunk files for each route files
      (routeFileChunksMap[fileAbsPath] ??= {
        files: pickedFiles.slice(),
      }).files.push(...pickedFiles);
    }
  }

  // generate indexes for file chunks
  Object.values(routeFileChunksMap).forEach((item) => {
    item.indexes = item.files.map((f) => routeChunkFiles[f].index);
  });

  return {
    routeChunkFiles,
    routeFileChunksMap,
  };
}

async function getRoutePathFilesMap(
  routes: Record<string, IRoute>,
  fileChunksMap: Awaited<
    ReturnType<typeof getRouteChunkFilesMap>
  >['routeFileChunksMap'],
  opts: { resolver: ReturnType<typeof createResolver>; absPagesPath: string },
) {
  const { resolver, absPagesPath } = opts;
  const routeFilesMap: Record<string, number[]> = {};

  for (const route of Object.values<IRoute>(routes)) {
    // skip redirect route
    if (!route.file) continue;

    // skip illegal absPath route
    if (!route.absPath?.startsWith('/')) {
      logger.error(
        `[routePreloadOnLoad]: route absPath error, cannot preload for ${route.absPath}`,
      );
      continue;
    }

    let current: IRoute | undefined = route;
    const files: string[] = [];

    do {
      // skip inline function route file
      if (current.file && !current.file.startsWith('(')) {
        try {
          const fileReqPath =
            isAbsolute(current.file) || current.file.startsWith('@/')
              ? current.file
              : // a => ./a
                // .a => ./.a
                current.file.replace(/^([^.]|\.[^./])/, './$1');
          const fileAbsPath = await resolver.resolve(absPagesPath, fileReqPath);

          files.push(fileAbsPath);
        } catch {
          logger.error(
            `[routePreloadOnLoad]: route file resolve error, cannot preload for ${current.file}`,
          );
        }
      }
      current = current.parentId ? routes[current.parentId] : undefined;
    } while (current);

    const indexes = Array.from(
      // use set to avoid duplicated indexes
      files.reduce<Set<number>>((indexSet, file) => {
        // why fileChunksMap[file] may not existing?
        // because Mako will merge minimal async chunk into entry chunk
        // so the merged route chunk does not has to preload
        fileChunksMap[file]?.indexes!.forEach((i) => indexSet.add(i));

        return indexSet;
      }, new Set()),
    );
    const { absPath } = route;

    routeFilesMap[absPath] =
      // why different route may has same absPath?
      // because umi implement route.wrappers via nested routes way, the wrapper route will has same absPath with the nested route
      // so we always select the longest file indexes for the nested route
      !routeFilesMap[absPath] || routeFilesMap[absPath].length < indexes.length
        ? indexes
        : routeFilesMap[absPath];
  }

  return routeFilesMap;
}

export default (api: IApi) => {
  let routeChunkFilesMap: IRouteChunkFilesMap;
  let preloadJSFileExt = '.js';
  api.describe({
    enableBy: () =>
      // enable when package name available
      // because preload script use package name as attribute prefix value
      Boolean(api.pkg.name) &&
      // vite mode is not supported currently
      !api.config.vite &&
      // mpa mode is unnecessary
      !api.config.mpa &&
      // only esm router needs this feature
      api.config.routeLoader?.moduleType === 'esm',
  });

  api.addHTMLHeadScripts({
    fn: () => {
      if (api.name === 'build' && routeChunkFilesMap) {
        const { publicPath } = api.config;
        const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;
        // internal tern app use map mode
        return api.config.tern
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
                src: `${displayPublicPath}${PRELOAD_ROUTE_HELPER}${preloadJSFileExt}`,
              },
            ];
      }

      return [];
    },
    stage: Infinity,
  });

  api.onBuildComplete(async ({ err, stats }) => {
    if (!err && !stats.hasErrors()) {
      const routeModulePath = join(api.paths.absTmpPath, 'core/route.tsx');
      const resolver = createResolver({ alias: api.config.alias });
      const { chunks = [] } = stats.toJson
        ? // webpack
          stats.toJson()
        : // mako
          (stats.compilation as unknown as StatsCompilation);

      // 1. collect all route chunk files and file chunks indexes from stats
      const { routeChunkFiles, routeFileChunksMap } =
        await getRouteChunkFilesMap(chunks, {
          resolver,
          routeModulePath,
          routeModuleName: winPath(relative(api.cwd, routeModulePath)),
        });

      // 2. generate map for path -> files (include parent route files)
      const routeFilesMap = await getRoutePathFilesMap(
        api.appData.routes,
        routeFileChunksMap,
        { resolver, absPagesPath: api.paths.absPagesPath },
      );

      // 3. generate final route chunk files map
      if (!lodash.isEmpty(routeChunkFiles) && !lodash.isEmpty(routeFilesMap)) {
        routeChunkFilesMap = {
          p: api.pkg.name!,
          b: api.appData.bundler!,
          f: Object.entries(routeChunkFiles)
            .sort((a, b) => a[1].index - b[1].index)
            .map(([k, { id }]) => [k, id]),
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
      if (api.name === 'build' && routeChunkFilesMap && !api.config.tern) {
        const content = readFileSync(
          join(TEMPLATES_DIR, 'routePreloadOnLoad/preloadRouteFilesScp.js'),
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
          );
        if (api.config.hash) {
          preloadJSFileExt = `.${createHash('md5')
            .update(content)
            .digest('hex')
            .substring(0, 8)}.js`;
        }

        writeFileSync(
          join(
            api.paths.absOutputPath,
            `${PRELOAD_ROUTE_HELPER}${preloadJSFileExt}`,
          ),
          content,
          'utf-8',
        );
      }
    }
  });
};
