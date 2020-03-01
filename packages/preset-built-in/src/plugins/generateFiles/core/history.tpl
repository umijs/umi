import { createMemoryHistory, createHashHistory, createBrowserHistory } from '{{{ runtimePath }}}';

const options = {{{ options }}};
if ((<any>window).routerBase) {
  options.basename = (<any>window).routerBase;
}

let history = {{{ creator }}}(options);
export const createHistory = () => {
  // 先注释了，加上后 HMR 后路由跳转功能会失效
  // history = {{{ creator }}}(options);
  return history;
};
export { history };
