import type { RequestHandler } from '@umijs/bundler-webpack/compiled/express';
import { chokidar, lodash } from '@umijs/utils';
import { cleanRequireCache, IGetMockDataResult, matchMock } from './utils';

export interface IMockOpts extends IGetMockDataResult {
  updateMockData: () => Promise<IGetMockDataResult>;
}

interface ICreateMiddleware {
  middleware: RequestHandler;
  watcher: chokidar.FSWatcher;
}

const createMiddleware = (opts = {} as IMockOpts): ICreateMiddleware => {
  const { mockData, mockWatcherPaths, updateMockData } = opts;
  let data = mockData;

  // watcher
  const errors: Error[] = [];
  // console.log('mockWatcherPaths', mockWatcherPaths);
  const watcher = chokidar.watch(mockWatcherPaths, {
    ignoreInitial: true,
  });
  watcher
    .on('ready', () => console.log('Initial scan complete. Ready for changes'))
    .on(
      'all',
      // debounce avoiding too much file change events
      lodash.debounce(async (event, file) => {
        console.log(`[${event}] ${file}, reload mock data`);
        errors.splice(0, errors.length);
        cleanRequireCache(mockWatcherPaths);
        // refresh data
        data = (await updateMockData())?.mockData;
        if (!errors.length) {
          console.info(`Mock files parse success`);
        }
      }, 300),
    );
  // close
  process.once('SIGINT', async () => {
    await watcher.close();
  });

  return {
    middleware: (req, res, next) => {
      const match = data && matchMock(req, data);
      if (match) {
        // console.log(`mock matched: [${match.method}] ${match.path}`);
        return match.handler(req, res, next);
      } else {
        return next();
      }
    },
    watcher,
  } as ICreateMiddleware;
};

export default createMiddleware;
