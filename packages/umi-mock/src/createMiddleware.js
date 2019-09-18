import { basename, join } from 'path';
import chokidar from 'chokidar';
import signale from 'signale';
import { winPath } from 'umi-utils';
import matchMock from './matchMock';
import getMockData from './getMockData';
import getPaths from './getPaths';

const debug = require('debug')('umi-mock:createMiddleware');

function noop() {}

export default function(opts = {}) {
  const {
    cwd,
    errors = [],
    config,
    absPagesPath,
    absSrcPath,
    watch,
    onStart = noop,
    onError = noop,
  } = opts;
  const { absMockPath, absConfigPath, absConfigPathWithTS } = getPaths(cwd);
  const mockPaths = [absMockPath, absConfigPath, absConfigPathWithTS];
  const paths = [...mockPaths, winPath(basename(absSrcPath) === 'src' ? absSrcPath : absPagesPath)];
  let mockData = null;

  // registerBabel 和 clean require cache 包含整个 src 目录
  // 而 watch 只包含 pages/**/_mock.[jt]s
  onStart({ paths });
  fetchMockData();

  let watcher = null;
  if (watch) {
    // chokidar 在 windows 下使用反斜杠组成的 glob 无法正确 watch 文件变动
    // ref: https://github.com/paulmillr/chokidar/issues/777
    const absPagesGlobPath = winPath(join(absPagesPath, '**/_mock.[jt]s'));
    watcher = chokidar.watch([...mockPaths, absPagesGlobPath], {
      ignoreInitial: true,
    });
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`);
      errors.splice(0, errors.length);
      cleanRequireCache();
      fetchMockData();
      if (!errors.length) {
        signale.success(`Mock files parse success`);
      }
    });
    process.once('SIGINT', () => {
      watcher.close();
    });
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (
        paths.some(path => {
          return winPath(file).indexOf(path) > -1;
        })
      ) {
        delete require.cache[file];
      }
    });
  }

  function fetchMockData() {
    mockData = getMockData({
      cwd,
      config,
      absPagesPath,
      onError(e) {
        onError(e);
        errors.push(e);
      },
    });
  }

  return {
    middleware: function UMI_MOCK(req, res, next) {
      const match = mockData && matchMock(req, mockData);
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
