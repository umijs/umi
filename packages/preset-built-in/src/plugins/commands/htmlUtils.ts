import { IApi, IRoute, webpack } from '@umijs/types';
import { join } from 'path';
import { existsSync } from 'fs';
import { lodash } from '@umijs/utils';

interface IGetContentArgs {
  route: IRoute;
  jsFiles?: any[];
  cssFiles?: any[];
}

export function chunksToFiles(
  chunks: webpack.compilation.Chunk[],
): { cssFiles: string[]; jsFiles: string[] } {
  const cssFiles: string[] = [];
  const jsFiles: string[] = [];

  chunks.forEach(chunk => {
    const { files } = chunk;
    files.forEach(file => {
      if (/\.js$/.test(file)) {
        jsFiles.push(file);
      }
      if (/\.css$/.test(file)) {
        cssFiles.push(file);
      }
    });
  });
  return {
    cssFiles: lodash.uniq(cssFiles),
    jsFiles: lodash.uniq(jsFiles),
  };
}

export function getHtmlGenerator({ api }: { api: IApi }): any {
  function getDocumentTplPath() {
    const docPath = join(api.paths.absPagesPath!, 'document.ejs');
    return existsSync(docPath) ? docPath : '';
  }

  class Html extends api.Html {
    constructor() {
      super({
        config: api.config,
        tplPath: getDocumentTplPath(),
      });
    }

    async getContent(args: IGetContentArgs): Promise<string> {
      async function applyPlugins(opts: { initialState?: any[]; key: string }) {
        return await api.applyPlugins({
          key: opts.key,
          type: api.ApplyPluginsType.add,
          initialValue: opts.initialState || [],
          args: {
            route: args.route,
          },
        });
      }

      return await super.getContent({
        route: args.route,
        cssFiles: args.cssFiles || [],
        jsFiles: args.jsFiles || [],
        headScripts: await applyPlugins({
          key: 'addHTMLHeadScripts',
        }),
        links: await applyPlugins({
          key: 'addHTMLLinks',
        }),
        metas: await applyPlugins({
          key: 'addHTMLMetas',
        }),
        scripts: await applyPlugins({
          key: 'addHTMLScripts',
        }),
        styles: await applyPlugins({
          key: 'addHTMLStyles',
        }),
        async modifyHTML(memo: any, args: object) {
          return await api.applyPlugins({
            key: 'modifyHTML',
            type: api.ApplyPluginsType.modify,
            initialValue: memo,
            args,
          });
        },
      });
    }
  }

  return new Html();
}
