import { createMemoryHistory, createHashHistory, createBrowserHistory } from '{{{ runtimePath }}}';

const options = {{{ options }}};
if ((<any>window).routerBase) {
  options.basename = (<any>window).routerBase;
}

let history = {{{ creator }}}(options);
export const createHistory = (hotReload = false) => {
  if (!hotReload) {
    history = {{{ creator }}}(options);
  }

  return history;
};
export { history };
