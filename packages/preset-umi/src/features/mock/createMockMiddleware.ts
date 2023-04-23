import type { RequestHandler } from '@umijs/bundler-webpack/compiled/express';
import pathToRegexp from 'path-to-regexp';
import bodyParser from '../../../compiled/body-parser';
import multer from '../../../compiled/multer';
import type { IMock } from './getMockData';

export function createMockMiddleware(opts: {
  context: { mockData: Record<string, IMock> };
}): RequestHandler {
  return (req, res, next) => {
    const method = req.method.toUpperCase();
    for (const key of Object.keys(opts.context.mockData)) {
      const mock = opts.context.mockData[key];
      if (mock.method !== method) continue;
      const { keys, re } = getPathReAndKeys(mock.path);
      const m = re.exec(req.path);
      if (m) {
        if (typeof mock.handler === 'function') {
          // add params
          const params: Record<string, any> = {};
          for (let i = 1; i < m.length; i += 1) {
            const key = keys[i - 1];
            const prop = key.name;
            const val = decodeParam(m[i]);
            if (val !== undefined) {
              params[prop] = val;
            }
          }
          req.params = params;
          // handler
          if (method === 'GET') {
            mock.handler(req, res, next);
          } else {
            const jsonOpts = { limit: '5mb', strict: false };
            const urlEncodedOpts = { limit: '5mb', extended: true };
            // body parser + multer
            bodyParser.json(jsonOpts)(req, res, () => {
              bodyParser.urlencoded(urlEncodedOpts)(req, res, () => {
                // @ts-ignore
                multer().any()(req, res, () => {
                  mock.handler(req, res, next);
                });
              });
            });
          }
        } else {
          res.status(200).json(mock.handler);
        }
        return;
      }
    }
    next();
  };
}

// TODO: cache
function getPathReAndKeys(path: string) {
  const keys: any[] = [];
  const re = pathToRegexp(path, keys);
  return { re, keys };
}

function decodeParam(val: any) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }
  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = `Failed to decode param ' ${val} '`;
      // @ts-ignore
      err.status = 400;
      // @ts-ignore
      err.statusCode = 400;
    }
    throw err;
  }
}
