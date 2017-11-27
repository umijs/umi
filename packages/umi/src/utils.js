/* global window */
import { parse } from 'url';
import querystring from 'query-string';

export function isLocal(href) {
  const url = parse(href, false, true);
  const origin = parse(window.location.origin, false, true);
  return (
    !url.host || (url.protocol === origin.protocol && url.host === origin.host)
  );
}

export function addRouterBase(path) {
  if (path.charAt(0) === '/') {
    return window.routerBase + path.slice(1);
  } else {
    return path;
  }
}

export function normalizePath(path) {
  if (typeof path === 'string') {
    const [pathname, search] = path.split('?');
    return `${pathname}.html${search ? '?' : ''}${search || ''}`;
  }

  const { pathname, query } = path;
  const search = querystring.stringify(query);
  if (!pathname) {
    throw new Error('path object must contain pathname');
  }
  return `${pathname}.html${search ? '?' : ''}${search}`;
}
