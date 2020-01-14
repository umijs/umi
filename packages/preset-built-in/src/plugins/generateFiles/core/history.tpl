import { createMemoryHistory, createHashHistory, createBrowserHistory } from '{{{ runtimePath }}}';

const userOptions = {{{ userOptions }}};
const history = {{{ creator }}}({
  basename: (<any>window).basename,
  ...userOptions,
});
export { history };
