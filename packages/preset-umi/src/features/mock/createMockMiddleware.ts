import type { RequestHandler } from '@umijs/bundler-webpack/compiled/express';
import type { IMock } from './getMockData';

export function createMockMiddleware(opts: {
  context: { mockData: Record<string, IMock> };
}): RequestHandler {
  return (req, res, next) => {
    const id = `${req.method.toUpperCase()} ${req.url}`;
    const mock = opts.context.mockData[id];
    if (mock) {
      if (typeof mock.handler === 'function') {
        mock.handler(req, res, next);
      } else {
        res.status(200).json(mock.handler);
      }
    } else {
      next();
    }
  };
}
