import { join,basename } from 'path';
import chokidar from 'chokidar';
import signale from 'signale';
import matchMock from './matchMock';
import getMockData from './getMockData';
import getPaths from './getPaths';

const debug = require('debug')('umi-mock:createMiddleware');

function noop() {}

export default function(opts = {}) {
  const {
    cwd,
    errors,
    config,
    absPagesPath,
    absSrcPath,
    watch,
    onStart = noop,
  } = opts;
  const { absMockPath, absConfigPath } = getPaths(cwd);
  const paths = [
    absMockPath,
    absConfigPath,
    join(absPagesPath, '**/_mock.js'),
  ];
  let mockData = null;

  onStart({ paths });
  fetchMockData();

  if (watch) {
    const watcher = chokidar.watch(paths, {
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
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (
        paths.some(path => {
          return file.indexOf(path) > -1;
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
        errors.push(e);
      },
    });
  }

  return function UMI_MOCK(req, res, next) {
    const match = mockData && matchMock(req, mockData);
    if (match) {
      debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
