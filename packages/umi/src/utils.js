/* global window */
import { parse } from 'url';

function addHtmlAffix(pathname) {
  if (pathname.slice(-1) === '/') {
    return pathname;
  } else {
    return `${pathname}.html`;
  }
}

export function normalizePath(path) {
  if (typeof path === 'string') {
    const [pathname, search] = path.split('?');
    return `${pathname}.html${search ? '?' : ''}${search || ''}`;
  }
  return {
    ...path,
    pathname: addHtmlAffix(pathname),
  };
}
