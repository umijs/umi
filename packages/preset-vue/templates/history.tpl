import { createWebHashHistory, createMemoryHistory, createWebHistory } from '{{{ rendererPath }}}';
import type { RouterHistory } from '{{{ rendererPath }}}';

let history: RouterHistory;

type LiteralUnion<T extends string> = T | Omit<T, T>;
type RoutePath = {{{routePaths}}}
export const $route = (to: LiteralUnion<RoutePath>) => {
  return to;
}


export function createHistory(opts: any) {
  if (opts.type === 'hash') {
    history = createWebHashHistory(opts.basename);
  } else if (opts.type === 'memory') {
    history = createMemoryHistory(opts.basename);
  } else {
    history = createWebHistory(opts.basename);
  }
  return history;
}

export { history };
