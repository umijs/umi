import { createMemoryHistory, createHashHistory, createBrowserHistory } from '{{{ runtimePath }}}';

const userOptions = {{{ userOptions }}};
const history = {{{ creator }}}({
  basename: window.basename,
  ...userOptions,
});
export { history };
