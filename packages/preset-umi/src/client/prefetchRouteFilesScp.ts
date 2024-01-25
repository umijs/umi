/**
 * NOTE: DO NOT USE ADVANCED SYNTAX IN THIS FILE, TO AVOID INSERT HELPERS TO REDUCE SCRIPT SIZE.
 */

import prefetchRouteFiles from './prefetchRouteFiles';

const basename = '{{basename}}';
const publicPath = '{{publicPath}}';
const pathname = location.pathname;
const routePath =
  pathname.startsWith(basename) &&
  decodeURI(`/${pathname.slice(basename.length)}`);

// skip prefetch if basename not match
if (routePath) {
  prefetchRouteFiles(routePath, '{{routeChunkFilesMap}}' as any, {
    publicPath,
  });
}
