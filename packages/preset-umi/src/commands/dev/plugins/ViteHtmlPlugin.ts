import { getMarkup, IOpts } from '@umijs/server';
import { normalizeScripts, normalizeStyles } from '@umijs/utils';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { IApi } from '../../../types';
import { getMarkupArgs } from '../getMarkupArgs';

function parseContent(tags: Record<string, any>[]) {
  if (!tags.length) return [];
  return tags.filter((tag) => tag && tag.content);
}

function insertContent({
  result,
  tags,
  targetTag,
  injectTo,
}: {
  injectTo: 'head' | 'body';
  result: HtmlTagDescriptor[];
  tags: Record<string | 'content', any>;
  targetTag: 'style' | 'script';
}) {
  if (!tags.length) return;
  tags.forEach((tag: { [x: string]: any; content: any }) => {
    const { content, ...reset } = tag;
    result.push({
      tag: targetTag,
      injectTo,
      attrs: { ...reset },
      children: `${content}`,
    });
  });
}

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
                api.appData.hasSrcDir ? '/src/.umi/umi.ts' : '/.umi/umi.ts',
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
    // ref: https://github.com/umijs/umi/issues/8438
    async transformIndexHtml() {
      let {
        scripts = [],
        headScripts = [],
        styles = [],
      } = (await getMarkupArgs({ api })) as any;

      const htmlResult = [] as HtmlTagDescriptor[];

      scripts = parseContent(normalizeScripts(scripts));
      headScripts = parseContent(normalizeScripts(headScripts));
      styles = parseContent(normalizeStyles(styles));

      insertContent({
        targetTag: 'style',
        injectTo: 'head',
        result: htmlResult,
        tags: styles,
      });
      insertContent({
        targetTag: 'script',
        injectTo: 'body',
        result: htmlResult,
        tags: scripts,
      });
      insertContent({
        targetTag: 'script',
        injectTo: 'head',
        result: htmlResult,
        tags: headScripts,
      });
      return htmlResult;
    },
  };
}
