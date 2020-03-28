import { chokidar, signale, createDebug } from '@umijs/utils';
import { RequestHandler } from '@umijs/types';
import { cleanRequireCache, IGetMockDataResult, matchMock } from './utils';

const debug = createDebug('umi:preset-build-in:mock:createMiddleware');

export interface IMockOpts extends IGetMockDataResult {
  updateMockData: () => IGetMockDataResult;
}

interface ICreateMiddleware {
  middleware: RequestHandler;
  watcher: chokidar.FSWatcher;
}

export default function (opts = {} as IMockOpts): ICreateMiddleware {
  const { mockData, mockWatcherPaths, updateMockData } = opts;
  let data = mockData;

  // watcher
  const errors: Error[] = [];
  debug('mockWatcherPaths', mockWatcherPaths);
  const watcher = chokidar.watch(mockWatcherPaths, {
    ignoreInitial: true,
  });
  watcher
    .on('ready', () => debug('Initial scan complete. Ready for changes'))
    .on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`);
      errors.splice(0, errors.length);
      cleanRequireCache(mockWatcherPaths);
      // refresh data
      data = updateMockData()?.mockData;
      if (!errors.length) {
        signale.success(`Mock files parse success`);
      }
    });
  // close
  process.once('SIGINT', async () => {
    await watcher.close();
  });

  return {
    middleware: (req, res, next) => {
      const match = data && matchMock(req, data);
      if (match) {
        debug(`mock matched: [${match.method}] ${match.path}`);
        return match.handler(req, res, next);
      } else {
        return next();
      }
    },
    watcher,
  };
}
