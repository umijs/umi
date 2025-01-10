import { getMarkup, IOpts } from '@umijs/server';
import type { Plugin } from 'vite';
import { IApi } from '../../../types';
import { getMarkupArgs } from '../getMarkupArgs';

export default function ViteHtmlPlugin(api: IApi): Plugin {
  return {
    name: 'vite-plugin-umi-html',
    configureServer(server) {
      return () => {
        server.middlewares.use(async function kmiViteHtmlMiddleware(
          req,
          res,
          next,
        ) {
          if (!req.url?.endsWith('.html') && req.url !== '/') {
            return next();
          }

          if (req.headers.accept?.includes('text/html')) {
            try {
              // 处理通用html
              const viteScripts: IOpts['scripts'] = [
                `${api.appData.hasSrcDir ? '/src' : ''}/.${
                  api.service.frameworkName
                }/umi.ts`,
              ];

              const markupArgs = (await getMarkupArgs({ api })) as any;

              const opts: IOpts = {
                ...markupArgs,
                esmScript: true,
                scripts: viteScripts.concat(markupArgs.scripts),
                historyType: api.config.history?.type || 'browser',
              };

              const html = await getMarkup({ ...opts });

              res.setHeader('Content-Type', 'text/html');
              res.end(await server.transformIndexHtml(req.url, html));
            } catch (e) {
              return next(e);
            }
          }

          next();
        });
      };
    },
  };
}
