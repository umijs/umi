import { createHashHistory, createMemoryHistory, createBrowserHistory, History } from '{{{ rendererPath }}}';

let history: History;
export function createHistory(opts: any) {
  if (opts.type === 'hash') {
    history = createHashHistory();
  } else if (opts.type === 'memory') {
    history = createMemoryHistory();
  } else {
    history = createBrowserHistory();
  }
  return history;
}

export { history };
