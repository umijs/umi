import { createHashHistory, createMemoryHistory, createBrowserHistory, History, Path } from '{{{ historyPath }}}';

type LiteralUnion<T extends string> = T | Omit<T, T>;
type RoutePath = {{{routePaths}}}
type To = LiteralUnion<RoutePath> | Partial<Omit<Path, 'pathname'> & {
  pathname: LiteralUnion<RoutePath>;
}>

let history: Omit<History, 'push' | 'replace'> & {
  push(to: To, state?: any): void;
  replace(to: To, state?: any): void;
};

export const $route = (to: LiteralUnion<RoutePath>) => {
  return to;
}

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
    push(to: To, state) {
      h.push(patchTo(to), state);
    },
    replace(to: To, state) {
      h.replace(patchTo(to), state);
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
function patchTo(to: any) {
  if (typeof to === 'string') {
    return `${stripLastSlash(basename)}${to}`;
  } else if (typeof to === 'object' && to.pathname) {
    return {
      ...to,
      pathname: `${stripLastSlash(basename)}${to.pathname}`,
    };
  } else {
    throw new Error(`Unexpected to: ${to}`);
  }
}

function stripLastSlash(path) {
  return path.slice(-1) === '/' ? path.slice(0, -1) : path;
}

export { history };
