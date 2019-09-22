import chokidar from 'chokidar';
import { join, isAbsolute } from 'path';

// 按 key 存，值为数组
const watchers = {};

export function toAbsolute(p) {
  if (isAbsolute(p)) {
    return p;
  }
  return join(process.cwd(), p);
}

export function watch(key, files) {
  if (process.env.WATCH_FILES === 'none') return;
  if (!watchers[key]) {
    watchers[key] = [];
  }
  const { APP_ROOT } = process.env;
  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    cwd: APP_ROOT ? toAbsolute(APP_ROOT) : process.cwd(),
  });
  watchers[key].push(watcher);
  return watcher;
}

export function unwatch(key) {
  if (!key) {
    return Object.keys(watchers).forEach(unwatch);
  }
  if (watchers[key]) {
    watchers[key].forEach(watcher => {
      watcher.close();
    });
  }
}
