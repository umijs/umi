import { chokidar, winPath } from '@umijs/utils';

const unWatches: Function[] = [];

export function addUnWatch(unWatcher: Function) {
  unWatches.push(unWatcher);
}

export function watch(opts: {
  path: string | ReadonlyArray<string>;
  watchOpts?: chokidar.WatchOptions;
  addToUnWatches?: boolean;
  onChange: (event: string, path: string) => void;
}) {
  const watcher = chokidar.watch(opts.path, {
    ...opts.watchOpts,
    ignoreInitial: true,
  });
  watcher.on('all', opts.onChange);
  if (opts.addToUnWatches) {
    addUnWatch(() => {
      watcher.close();
    });
  }
  return watcher;
}

export function createDebouncedHandler(opts: {
  timeout?: number;
  onChange: (opts: {
    files: { event: string; path: string }[];
  }) => Promise<any>;
}) {
  let timer: any = null;
  let files: { event: string; path: string }[] = [];
  return (event: string, path: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    files.push({ event, path: winPath(path) });
    timer = setTimeout(async () => {
      timer = null;
      await opts.onChange({ files });
      files = [];
    }, opts.timeout || 2000);
  };
}

export function unwatch() {
  unWatches.forEach((unWatch) => unWatch());
}

export function expandJSPaths(path: string) {
  return ['.js', '.jsx', '.ts', '.tsx'].map((ext) => {
    return `${path}${ext}`;
  });
}

export function expandCSSPaths(path: string) {
  return ['.css', '.less', '.scss', '.sass'].map((ext) => {
    return `${path}${ext}`;
  });
}
