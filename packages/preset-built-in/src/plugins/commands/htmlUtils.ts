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

      return await super.getContent({
        route: args.route,
        cssFiles: args.cssFiles || [],
        jsFiles: args.jsFiles || [],
        headScripts: await applyPlugins({
          key: 'addHTMLHeadScripts',
          initialState: [
            // routerBase 只在部署路径不固定时才会用到，exportStatic.dynamicRoot
            api.config.exportStatic?.dynamicRoot && {
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
      const paths = getRoutePaths({ routes });

      return paths.map(path => {
        // @ts-ignore
        const file = this.getHtmlPath(path);
        return {
          path,
          file,
        };
      });
    }
  }

  return new Html();
}

export function getRoutePaths(opts: { routes: IRoute[] }): string[] {
  return opts.routes.reduce((memo, route) => {
    const { routes, path } = route;
    if (path && !path.includes('?')) {
      memo.push(path);
    }
    if (routes) {
      memo.concat(
        getRoutePaths({
          routes,
        }),
      );
    }
    return lodash.uniq(memo);
  }, [] as string[]);
}
