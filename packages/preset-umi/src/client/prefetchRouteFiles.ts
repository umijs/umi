/**
 * NOTE: DO NOT USE ADVANCED SYNTAX IN THIS FILE, TO AVOID INSERT HELPERS TO REDUCE SCRIPT SIZE.
 */

import type { IRouteChunkFilesMap } from '../features/routePrefetch/routePrefetch';

function prefetchRouteFiles(
  path: string,
  map: IRouteChunkFilesMap,
  opts: { publicPath: string },
) {
  const doc = document;
  const head = doc.head;
  const createElement = doc.createElement.bind(doc);
  const publicPath = opts.publicPath;
  let matched: IRouteChunkFilesMap['r'][string] | undefined =
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

  matched?.forEach((i) => {
    const id = map.f[i][1];
    const file = map.f[i][0];
    const ext = file.split('.').pop();
    let tag: HTMLLinkElement | HTMLScriptElement;

    if (ext === 'js') {
      tag = createElement('script');
      tag.src = `${publicPath}${file}`;
      tag.async = true;
    } else if (ext === 'css') {
      tag = createElement('link');
      tag.href = `${publicPath}${file}`;
      tag.rel = 'preload';
      tag.as = 'style';
    } else {
      return;
    }

    tag.setAttribute(`data-${map.b}`, `${map.p}:${id}`);

    head.appendChild(tag);
  });
}

export default prefetchRouteFiles;
