import http from 'http';
import { createServer as createViteServer } from 'vite';
import { logger } from '@umijs/utils';
import express from '../../compiled/express';

import type { InlineConfig as ViteInlineConfig } from 'vite';
import type { IConfig } from '../types';


interface IOpts {
  cwd: string;
  viteConfig: ViteInlineConfig;
  userConfig: IConfig;
  beforeMiddlewares?: any[];
  afterMiddlewares?: any[];
}

export async function createServer(opts: IOpts) {
  const { viteConfig } = opts;
  const app = express();
  const vite = await createViteServer({ ...viteConfig, server: { middlewareMode: 'html' } });

  // use vite via middleware way
  app.use(vite.middlewares);

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // writeToDisk(?)
  // mock
  // proxy
  // prerender
  // bundless
  // onDevCompileDone

  // after middlewares
  (opts.afterMiddlewares || []).forEach((m) => app.use(m));

  const server = http.createServer(app);

  const port = process.env.PORT || 8000;
  server.listen(port, () => {
    logger.ready(
      `Example app listening at http://${
        process.env.HOST || '127.0.0.1'
      }:${port}`,
    );
  });

  return server;
}
