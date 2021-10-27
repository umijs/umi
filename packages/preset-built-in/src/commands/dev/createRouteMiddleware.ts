import { RequestHandler } from '@umijs/bundler-webpack';
import { createRequestHandler } from '@umijs/server';
import { IApi } from '../../types';

export function createRouteMiddleware(opts: { api: IApi }): RequestHandler {
  return async (req, res, next) => {
    const { vite } = opts.api.args;
    const requestHandler = await createRequestHandler({
      routes: opts.api.appData.routes,
      scripts: vite ? ['/.umi/umi.ts'] : ['/umi.js'],
      esmScript: vite,
      config: opts.api.config,
    });
    requestHandler(req, res, next);
  };
}
