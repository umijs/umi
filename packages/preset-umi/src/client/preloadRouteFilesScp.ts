/**
 * NOTE: DO NOT USE ADVANCED SYNTAX IN THIS FILE, TO AVOID INSERT HELPERS TO REDUCE SCRIPT SIZE.
 */

import { getPreloadRouteFiles } from '../features/routePreloadOnLoad/utils';

// always add trailing slash for base
const basename = '{{basename}}'.replace(/([^/])$/, '$1/');
const publicPath = '{{publicPath}}';
const pathname = location.pathname;
const routePath =
  pathname.startsWith(basename) &&
  decodeURI(`/${pathname.slice(basename.length)}`);

// skip preload if basename not match
if (routePath) {
  const map = '{{routeChunkFilesMap}}' as any;
  const doc = document;
  const head = doc.head;
  const createElement = doc.createElement.bind(doc);
  const files = getPreloadRouteFiles(routePath, map, {
    publicPath,
  });

  files?.forEach((file) => {
    const type = file.type;
    const url = file.url;
    let tag: HTMLLinkElement | HTMLScriptElement;

    if (type === 'js') {
      tag = createElement('script');
      tag.src = url;
      tag.async = true;
    } else if (type === 'css') {
      tag = createElement('link');
      tag.href = url;
      tag.rel = 'preload';
      tag.as = 'style';
    } else {
      return;
    }

    file.attrs.forEach((attr) => {
      tag.setAttribute(attr[0], attr[1] || '');
    });

    head.appendChild(tag);
  });
}
