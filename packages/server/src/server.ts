import type { RequestHandler } from 'express';

interface IOpts {}

export function createRequestHandler(opts: IOpts): RequestHandler {
  opts;
  return (req, res, next) => {
    req;
    res;
    next;
  };
}
