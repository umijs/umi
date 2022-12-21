// @ts-ignore
import { createHashHistory, createMemoryHistory, createBrowserHistory, History } from '{{{ historyPath }}}';

let history: History;
let basename: string = '/';
export function createHistory(opts: any) {
  let h;
  if (opts.type === 'hash') {
    h = createHashHistory();
  } else if (opts.type === 'memory') {
    h = createMemoryHistory(opts);
  } else {
    h = createBrowserHistory();
  }
  if (opts.basename) {
    basename = opts.basename;
  }

  history = {
    ...h,
    push(to, state) {
      h.push(patchTo(to, h, basename), state);
    },
    replace(to, state) {
      h.replace(patchTo(to, h, basename), state);
    },
    get location() {
      return h.location;
    },
    get action() {
      return h.action;
    }
  }

  return h;
}

// Patch `to` to support basename
// Refs:
// https://github.com/remix-run/history/blob/3e9dab4/packages/history/index.ts#L484
// https://github.com/remix-run/history/blob/dev/docs/api-reference.md#to
function patchTo(to: any, h: History, basename: string) {
  if (typeof to === 'string') {
    if (isAbsolute(to)) {
      return `${stripLastSlash(basename)}${to}`;
    } else {
      return `${stripLastSlash(basename)}${resolvePath(to, h, basename)}`;
    }
  } else if (typeof to === 'object') {

    const currentPathname = h.location.pathname;

    return {
      ...to,
      pathname: to.pathname ? `${stripLastSlash(basename)}${resolvePath(to.pathname, h, basename)}` : currentPathname,
    };
  } else {
    throw new Error(`Unexpected to: ${to}`);
  }
}

function stripLastSlash(path) {
  return path.slice(-1) === '/' ? path.slice(0, -1) : path;
}
function resolvePath(pathname: string, h: History, basename:string ){
  let fromPath= h.location.pathname

  if(basename ==='/' || basename ===''){
  }else{
    fromPath = fromPath.replace(new RegExp(`^${stripLastSlash(basename)}`), '') || '/'
  }

  return resolvePathname(pathname, fromPath)
}

function isAbsolute(pathname:string): boolean {
  return pathname.charAt(0) === '/';
}

// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list: any[], index:number) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
}

function resolvePathname(to: string, from :string = ''): string {

  const toParts = (to && to.split('/')) || [];
  let fromParts = (from && from.split('/')) || [];

  const isToAbs = to && isAbsolute(to);
  const isFromAbs = from && isAbsolute(from);
  const mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  let hasTrailingSlash;
  if (fromParts.length) {
    const last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  let up = 0;
  for (let i = fromParts.length; i >= 0; i--) {
    const part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');

  if (
    mustEndAbs &&
    fromParts[0] !== '' &&
    (!fromParts[0] || !isAbsolute(fromParts[0]))
  )
    fromParts.unshift('');

  let result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
}

export { history };
