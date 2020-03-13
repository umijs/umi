import { IApi, IRoute, webpack } from '@umijs/types';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { lodash } from '@umijs/utils';
import assert from 'assert';

interface IGetContentArgs {
  route: IRoute;
  chunks?: any;
  noChunk?: boolean;
}

interface IHtmlChunk {
  name: string;
  headScript?: boolean;
}

interface IChunkMap {
  [key: string]: string;
}

export function chunksToFiles(opts: {
  htmlChunks: (string | object)[];
  chunks?: webpack.compilation.Chunk[];
  noChunk?: boolean;
}): { cssFiles: string[]; jsFiles: string[]; headJSFiles: string[] } {
  let chunksMap: IChunkMap = {};
  if (opts.chunks) {
    chunksMap = opts.chunks.reduce((memo, chunk) => {
      const key = chunk.name || chunk.id;
      if (key && chunk.files) {
        chunk.files.forEach(file => {
          if (!file.includes('.hot-update')) {
            memo[`${key}${extname(file)}`] = file;
          }
        });
      }
      return memo;
    }, {} as IChunkMap);
  }

  const cssFiles: string[] = [];
  const jsFiles: string[] = [];
  const headJSFiles: string[] = [];

  const htmlChunks = opts.htmlChunks.map(htmlChunk => {
    return lodash.isPlainObject(htmlChunk) ? htmlChunk : { name: htmlChunk };
  });
  (htmlChunks as IHtmlChunk[]).forEach(({ name, headScript }: IHtmlChunk) => {
    const cssFile = opts.noChunk ? `${name}.css` : chunksMap[`${name}.css`];
    if (cssFile) {
      cssFiles.push(cssFile);
    }

    const jsFile = opts.noChunk ? `${name}.js` : chunksMap[`${name}.js`];
    assert(jsFile, `chunk of ${name} not found.`);

    if (headScript) {
      headJSFiles.push(jsFile);
    } else {
      jsFiles.push(jsFile);
    }
  });

  return {
    cssFiles,
    jsFiles,
    headJSFiles,
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

      let routerBaseStr = JSON.stringify(api.config.base);
      let publicPathStr = JSON.stringify(api.config.publicPath);

      if (api.config.exportStatic?.dynamicRoot) {
        routerBaseStr = `location.pathname.split('/').slice(0, -${args.route.path!.split(
          '/',
        ).length - 1}).concat('').join('/')`;
        publicPathStr = `location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase`;
      }

      publicPathStr = await api.applyPlugins({
        key: 'modifyPublicPathStr',
        type: api.ApplyPluginsType.modify,
        initialValue: publicPathStr,
        args: {
          route: args.route,
        },
      });

      const htmlChunks = await api.applyPlugins({
        key: 'modifyHTMLChunks',
        type: api.ApplyPluginsType.modify,
        initialValue: api.config.chunks || ['umi'],
        args: {
          route: args.route,
        },
      });
      const { cssFiles, jsFiles, headJSFiles } = chunksToFiles({
        htmlChunks,
        chunks: args.chunks,
        noChunk: args.noChunk,
      });

      return await super.getContent({
        route: args.route,
        cssFiles,
        headJSFiles,
        jsFiles,
        headScripts: await applyPlugins({
          key: 'addHTMLHeadScripts',
          initialState: [
            // routerBase 只在部署路径不固定时才会用到，exportStatic.dynamicRoot
            // UPDATE: 内部 render 会依赖 routerBase，先始终生成
            /* api.config.exportStatic?.dynamicRoot && */ {
              content: `window.routerBase = ${routerBaseStr};`,
            },
            // html 里的 publicPath
            // 只在设置了 runtimePublicPath 或 exportStatic?.dynamicRoot 时才会用到
            // 设置了 exportStatic?.dynamicRoot 时会自动设置 runtimePublicPath
            api.config.runtimePublicPath && {
              content: `window.publicPath = ${publicPathStr};`,
            },
          ].filter(Boolean),
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
        // @ts-ignore
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

    async getRouteMap() {
      const routes = await api.getRoutes();
      const flatRoutes = getFlatRoutes({ routes });

      return flatRoutes.map(route => {
        // @ts-ignore
        const file = this.getHtmlPath(route.path);
        return {
          route,
          file,
        };
      });
    }
  }

  return new Html();
}

export function getFlatRoutes(opts: { routes: IRoute[] }): IRoute[] {
  return opts.routes.reduce((memo, route) => {
    const { routes, path } = route;
    if (path && !path.includes('?')) {
      memo.push(route);
    }
    if (routes) {
      memo = memo.concat(
        getFlatRoutes({
          routes,
        }),
      );
    }
    return memo;
  }, [] as IRoute[]);
}
