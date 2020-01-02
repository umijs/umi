function addHtmlAffix(pathname) {
  if (pathname.slice(-1) === '/' || pathname.slice(-5) === '.html') {
    return pathname;
  } else {
    return `${pathname}.html`;
  }
}

export function normalizePath(path) {
  if (typeof path === 'string') {
    const [pathname, search] = path.split('?');
    return `${addHtmlAffix(pathname)}${search ? '?' : ''}${search || ''}`;
  }
  return {
    ...path,
    pathname: addHtmlAffix(path.pathname || ''),
  };
}

export function isPromiseLike(obj) {
  return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
}
