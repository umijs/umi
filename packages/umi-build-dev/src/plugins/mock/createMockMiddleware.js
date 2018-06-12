import { existsSync } from 'fs';
import { join } from 'path';
import bodyParser from 'body-parser';
import glob from 'glob';
import assert from 'assert';
import chokidar from 'chokidar';

const VALID_METHODS = ['get', 'post', 'pust', 'delete'];

export default function getMockMiddleware(api) {
  const { debug } = api.utils;
  const { cwd } = api.service;
  const absMockPath = join(cwd, 'mock');
  const absConfigPath = join(cwd, '.umirc.mock.js');
  api.registerBabel([absMockPath, absConfigPath]);

  let mockData = getConfig();
  watch();

  function watch() {
    if (process.env.WATCH_FILES === 'none') return;
    const watcher = chokidar.watch([absConfigPath, absMockPath], {
      ignoreInitial: true,
    });
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}`);
      mockData = getConfig();
    });
  }

  function getConfig() {
    cleanRequireCache();
    let ret = null;
    if (existsSync(absConfigPath)) {
      ret = require(absConfigPath); // eslint-disable-line
    } else {
      const mockFiles = glob.sync('**/*.js', {
        cwd: absMockPath,
      });
      debug(`mockFiles: ${JSON.stringify(mockFiles)}`);
      ret = mockFiles.reduce((memo, mockFile) => {
        memo = {
          ...memo,
          ...require(join(absMockPath, mockFile)), // eslint-disable-line
        };
        return memo;
      }, {});
    }
    return normalizeConfig(ret);
  }

  function parseKey(key) {
    let method = 'get';
    let path = key;
    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ');
      method = splited[0].toLowerCase();
      path = splited[1]; // eslint-disable-line
    }
    assert(
      VALID_METHODS.includes(method),
      `Invalid method ${method} for path ${path}, please check your mock files.`,
    );
    return {
      method,
      path,
    };
  }

  function createHandler(method, path, handler) {
    return function(req, res, next) {
      if (method === 'post') {
        bodyParser.json({ limit: '5mb', strict: false })(req, res, () => {
          bodyParser.urlencoded({ limit: '5mb', extended: true })(
            req,
            res,
            () => {
              sendData();
            },
          );
        });
      } else {
        sendData();
      }

      function sendData() {
        if (typeof handler === 'function') {
          handler(req, res, next);
        } else {
          res.json(handler);
        }
      }
    };
  }

  function normalizeConfig(config) {
    return Object.keys(config).reduce((memo, key) => {
      const handler = config[key];
      const type = typeof handler;
      assert(
        type === 'function' || type === 'object',
        `mock value of ${key} should be function or object, but got ${type}`,
      );
      const { method, path } = parseKey(key);
      memo.push({
        method,
        path,
        handler: createHandler(method, path, handler),
      });
      return memo;
    }, []);
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (file === absConfigPath || file.indexOf(absMockPath) > -1) {
        delete require.cache[file];
      }
    });
  }

  function matchMock(req) {
    const { path: exceptPath } = req;
    const exceptMethod = req.method.toLowerCase();

    return mockData.filter(({ method, path }) => {
      return method === exceptMethod && path === exceptPath;
    })[0];
  }

  return (req, res, next) => {
    const match = matchMock(req);
    if (match) {
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
