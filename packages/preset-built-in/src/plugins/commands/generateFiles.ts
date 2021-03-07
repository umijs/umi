import { IApi } from '@umijs/types';
import { chokidar, lodash, winPath } from '@umijs/utils';
import { join } from 'path';

export default async ({ api, watch }: { api: IApi; watch?: boolean }) => {
  const { paths } = api;

  async function generate(files?: { event: string; path: string }[]) {
    api.logger.debug('generate files', files);
    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
      args: {
        files: files || [],
      },
    });
  }

  const watchers: chokidar.FSWatcher[] = [];

  await generate();

  if (watch) {
    const watcherPaths = await api.applyPlugins({
      key: 'addTmpGenerateWatcherPaths',
      type: api.ApplyPluginsType.add,
      initialValue: [
        paths.absPagesPath!,
        join(paths.absSrcPath!, api.config?.singular ? 'layout' : 'layouts'),
        join(paths.absSrcPath!, 'app.tsx'),
        join(paths.absSrcPath!, 'app.ts'),
        join(paths.absSrcPath!, 'app.jsx'),
        join(paths.absSrcPath!, 'app.js'),
      ],
    });
    lodash
      .uniq<string>(watcherPaths.map((p: string) => winPath(p)))
      .forEach((p: string) => {
        createWatcher(p);
      });
    // process.on('SIGINT', () => {
    //   console.log('SIGINT');
    //   unwatch();
    // });
  }

  function unwatch() {
    watchers.forEach((watcher) => {
      watcher.close();
    });
  }

  function createWatcher(path: string) {
    const watcher = chokidar.watch(path, {
      // ignore .dotfiles and _mock.js
      ignored: /(^|[\/\\])(_mock.js$|\..)/,
      ignoreInitial: true,
    });
    let timer: any = null;
    let files: { event: string; path: string }[] = [];
    watcher.on('all', (event: string, path: string) => {
      if (timer) {
        clearTimeout(timer);
      }
      files.push({ event, path: winPath(path) });
      timer = setTimeout(async () => {
        timer = null;
        await generate(files);
        files = [];
      }, 2000);
    });
    watchers.push(watcher);
  }

  return unwatch;
};
