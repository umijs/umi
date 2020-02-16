import { createMemoryHistory, createHashHistory, createBrowserHistory } from '{{{ runtimePath }}}';

const options = {{{ options }}};
if ((<any>window).routerBase) {
  options.basename = (<any>window).routerBase;
}

const history = {{{ creator }}}(options);
export { history };
