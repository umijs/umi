import { IApi } from '@umijs/types';
import { chokidar, lodash, winPath } from '@umijs/utils';
import { join } from 'path';

export default async ({ api, watch }: { api: IApi; watch?: boolean }) => {
  const { paths } = api;

  async function generate() {
    api.logger.debug('generate files');
    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
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
    watcher.on(
      'all',
      lodash.throttle(async (event, path) => {
        // debug(`${event} ${path}`);
        await generate();
      }, 100),
    );
  }

  return unwatch;
};
