import createHistory from 'history/createBrowserHistory';
import { normalizePath } from './utils';

export default function(opts) {
  const history = createHistory(opts);
  if (__UMI_HTML_SUFFIX) {
    const oldPush = history.push;
    const oldReplace = history.replace;
    history.push = (path, state) => {
      oldPush(normalizePath(path), state);
    };
    history.replace = (path, state) => {
      oldReplace(normalizePath(path), state);
    };
  }
  return history;
}
