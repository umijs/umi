import { createMemoryHistory, createHashHistory, createBrowserHistory } from 'umi';

const userOptions = {{{ userOptions }}};
const history = {{{ creator }}}({
  basename: window.basename,
  ...userOptions,
});
export default history;
