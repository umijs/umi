import { createHashHistory, createMemoryHistory, createBrowserHistory, History } from '{{{ rendererPath }}}';

let history: History;
let basename: string = '/';
export function createHistory(opts: any) {
  let h;
  if (opts.type === 'hash') {
    h = createHashHistory();
  } else if (opts.type === 'memory') {
    h = createMemoryHistory();
  } else {
    h = createBrowserHistory();
  }
  if (opts.basename) {
    basename = opts.basename;
  }
  history = {
    ...h,
    push(to, state) {
      h.push(patchTo(to), state);
    },
    replace(to, state) {
      h.replace(patchTo(to), state);
    },
  }
  return h;
}

// Patch `to` to support basename
// Refs:
// https://github.com/remix-run/history/blob/3e9dab4/packages/history/index.ts#L484
// https://github.com/remix-run/history/blob/dev/docs/api-reference.md#to
function patchTo(to: any) {
  if (typeof to === 'string') {
    return `${basename}${to}`;
  } else if (typeof to === 'object' && to.pathname) {
    return {
      ...to,
      pathname: `${basename}${to.pathname}`,
    };
  } else {
    throw new Error(`Unexpected to: ${to}`);
  }
}

function stripFirstSlash(path) {
  return path.chatAt(0) === '/' ? path.slice(1) : path;
}

export { history };
