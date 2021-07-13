import { NextFunction, Request, RequestHandler, Response } from '@umijs/types';
import { chokidar, createDebug, lodash, signale } from '@umijs/utils';
import { cleanRequireCache, IGetMockDataResult, matchMock } from './utils';

const debug = createDebug('umi:preset-build-in:mock:createMiddleware');

export interface IMockOpts extends IGetMockDataResult {
  updateMockData: () => Promise<IGetMockDataResult>;
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
    .on(
      'all',
      // debounce avoiding too much file change events
      lodash.debounce(async (event, file) => {
        debug(`[${event}] ${file}, reload mock data`);
        errors.splice(0, errors.length);
        cleanRequireCache(mockWatcherPaths);
        // refresh data
        data = (await updateMockData())?.mockData;
        if (!errors.length) {
          signale.success(`Mock files parse success`);
        }
      }, 300),
    );
  // close
  process.once('SIGINT', async () => {
    await watcher.close();
  });

  return {
    middleware: (req: Request, res: Response, next: NextFunction) => {
      const match = data && matchMock(req, data);
      if (match) {
        debug(`mock matched: [${match.method}] ${match.path}`);
        return match.handler(req, res, next);
      } else {
        return next();
      }
    },
    watcher,
  } as ICreateMiddleware;
}
