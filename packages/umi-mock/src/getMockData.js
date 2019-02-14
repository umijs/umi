import { existsSync } from 'fs';
import bodyParser from 'body-parser';
import assert from 'assert';
import pathToRegexp from 'path-to-regexp';
import multer from 'multer';
import { join } from 'path';
import signale from 'signale';
import glob from 'glob';

const debug = require('debug')('umi-mock:getMockData');
const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const BODY_PARSED_METHODS = ['post', 'put', 'patch', 'delete'];

function createHandler(method, path, handler) {
  return function(req, res, next) {
    if (BODY_PARSED_METHODS.includes(method)) {
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
        multer().any()(req, res, () => {
          handler(req, res, next);
        });
      } else {
        res.json(handler);
      }
    }
  };
}

export function normalizeConfig(config) {
  return Object.keys(config).reduce((memo, key) => {
    const handler = config[key];
    const type = typeof handler;
    assert(
      type === 'function' || type === 'object',
      `mock value of ${key} should be function or object, but got ${type}`,
    );
    const { method, path } = parseKey(key);
    const keys = [];
    const re = pathToRegexp(path, keys);
    memo.push({
      method,
      path,
      re,
      keys,
      handler: createHandler(method, path, handler),
    });
    return memo;
  }, []);
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

function noop() {}

export function getMockConfig(opts) {
  const {
    cwd,
    absMockPath,
    absConfigPath,
    absPagesPath,
    config,
    onError = noop,
  } = opts;

  let ret = {};
  if (existsSync(absConfigPath)) {
    debug(`Load mock data from ${absConfigPath}`);
    ret = require(absConfigPath); // eslint-disable-line
  } else {
    const mockFiles = glob
      .sync('mock/**/*.js', {
        cwd,
        ignore: (config.mock || {}).exclude || [],
      })
      .map(p => join(cwd, p))
      .concat(
        glob
          .sync('**/_mock.js', {
            cwd: absPagesPath,
          })
          .map(p => join(absPagesPath, p)),
      );
    debug(
      `load mock data from ${absMockPath}, including files ${JSON.stringify(
        mockFiles,
      )}`,
    );
    try {
      ret = mockFiles.reduce((memo, mockFile) => {
        const m = require(mockFile); // eslint-disable-line
        memo = {
          ...memo,
          ...(m.default || m),
        };
        return memo;
      }, {});
    } catch (e) {
      onError(e);
      signale.error(`Mock file parse failed`);
      console.error(e.message);
    }
  }

  return ret;
}

export default function(opts) {
  return normalizeConfig(getMockConfig(opts));
}
