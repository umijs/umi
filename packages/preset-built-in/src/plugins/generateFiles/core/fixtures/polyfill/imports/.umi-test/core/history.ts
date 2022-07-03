// @ts-nocheck
import { createMemoryHistory, History } from '/Users/wangyiyi/work/project/umi/packages/runtime';

let options = {
  "initialEntries": [
    "/"
  ]
};
if ((<any>window).routerBase) {
  options.basename = (<any>window).routerBase;
}

// remove initial history because of ssr
let history: History = process.env.__IS_SERVER ? null : createMemoryHistory(options);
export const createHistory = (hotReload = false) => {
  if (!hotReload) {
    history = createMemoryHistory(options);
  }

  return history;
};

export { history };
