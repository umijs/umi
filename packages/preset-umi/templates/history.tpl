import { createHashHistory, createMemoryHistory, createBrowserHistory } from '{{{ historyPath }}}';
import type { UmiHistory } from './historyIntelli';

let history: UmiHistory;
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

{{#reactRouter5Compat}}
  h.goBack = function() {
    h.back();
  };
{{/reactRouter5Compat}}

  history = {
    ...h,
    push(to, state) {
      h.push(patchTo(to, h), state);
    },
    replace(to, state) {
      h.replace(patchTo(to, h), state);
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

export function setHistory(h: UmiHistory) {
  if (h) {
    history = h;
  }
}

// Patch `to` to support basename
// Refs:
// https://github.com/remix-run/history/blob/3e9dab4/packages/history/index.ts#L484
// https://github.com/remix-run/history/blob/dev/docs/api-reference.md#to
function patchTo(to: any, h: History) {
  if (typeof to === 'string') {
    return `${stripLastSlash(basename)}${to}`;
  } else if (typeof to === 'object') {

    const currentPathname = h.location.pathname;

    return {
      ...to,
      pathname: to.pathname? `${stripLastSlash(basename)}${to.pathname}` : currentPathname,
    };
  } else {
    throw new Error(`Unexpected to: ${to}`);
  }
}

function stripLastSlash(path) {
  return path.slice(-1) === '/' ? path.slice(0, -1) : path;
}

export { history };
