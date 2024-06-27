import { getMarkup } from '@umijs/server';
import { lodash, logger, Mustache, winPath } from '@umijs/utils';
import assert from 'assert';
import { dirname, join, relative } from 'path';
import type { IApi, IRoute } from '../../types';
import { absServerBuildPath } from '../ssr/utils';

let markupRender: any;
const IS_WIN = process.platform === 'win32';

interface IExportHtmlItem {
  route: {
    path: string;
    redirect?: string;
  };
  file: string;
  prerender: boolean;
}

type IUserExtraRoute = string | { path: string; prerender: boolean };

function isHtmlRoute(route: IRoute): boolean {
  const is404 = route.absPath === '/*';

  if (
    // skip layout
    !route.isLayout &&
    // skip duplicate route
    !route.path.endsWith('.html') &&
    // skip dynamic route for win, because `:` is not allowed in file name
    (!IS_WIN || !route.path.includes('/:')) &&
    // skip `*` route, because `*` is not working for most site serve services
    (!route.path.includes('*') ||
      // except `404.html`
      is404)
  ) {
    return true;
  }
  return false;
}
function getHtmlPath(path: string, htmlSuffix: boolean): string {
  if (!path) return path;
  if (path === '/*') return '/404.html';
  if (path === '/') return '/index.html';

  if (path.endsWith('/')) path = path.slice(0, -1);
  return htmlSuffix ? `${path}.html` : `${path}/index.html`;
}
/**
 * get export html data from routes
 */
function getExportHtmlData(
  routes: Record<string, IRoute>,
  htmlSuffix: boolean,
): IExportHtmlItem[] {
  const map = new Map<string, IExportHtmlItem>();

  for (const route of Object.values(routes)) {
    const is404 = route.absPath === '/*';

    if (isHtmlRoute(route)) {
      const file = join('.', getHtmlPath(route.absPath, htmlSuffix));

      map.set(file, {
        route: {
          path: is404 ? '/404' : route.absPath,
          redirect: route.redirect,
        },
        prerender: route.prerender !== false,
        file,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * get pre-rendered html by route path
 */
async function getPreRenderedHTML(api: IApi, htmlTpl: string, path: string) {
  const {
    exportStatic: { ignorePreRenderError = false },
  } = api.config;
  markupRender ??= require(absServerBuildPath(api))._markupGenerator;

  try {
    const html = await markupRender(path);
    logger.info(`Pre-render for ${path}`);
    return html;
  } catch (err) {
    logger.error(`Pre-render ${path} error: ${err}`);
    if (!ignorePreRenderError) {
      throw err;
    }
  }

  return htmlTpl;
}

export default (api: IApi) => {
  /**
   * convert user `exportStatic.extraRoutePaths` config to routes
   */
  async function getRoutesFromUserExtraPaths(
    routePaths:
      | IUserExtraRoute[]
      | (() => IUserExtraRoute[] | Promise<IUserExtraRoute[]>),
  ) {
    const paths =
      typeof routePaths === 'function' ? await routePaths() : routePaths;

    return paths.reduce<Record<string, IRoute>>((acc, item) => {
      const routePath = typeof item === 'string' ? item : item.path;

      acc[routePath] = {
        id: routePath,
        absPath: routePath,
        path: routePath.slice(1),
        file: '',
        // allow user to disable prerender for extra route
        ...(typeof item === 'object' && item.prerender === false
          ? { prerender: false }
          : {}),
      };

      return acc;
    }, {});
  }

  api.describe({
    config: {
      schema: ({ zod }) =>
        zod
          .object({
            htmlSuffix: zod.boolean(),
            dynamicRoot: zod.boolean(),
            extraRoutePaths: zod.union([
              zod.function(),
              zod.array(zod.string()),
            ]),
            ignorePreRenderError: zod.boolean().default(false),
          })
          .deepPartial(),
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheck(() => {
    assert(!api.config.mpa, '`exportStatic` is not supported in `mpa` mode.');
  });

  // export routes to html files
  api.modifyExportHTMLFiles(async (_defaultFiles, opts) => {
    const {
      publicPath,
      base,
      exportStatic: { htmlSuffix, dynamicRoot },
    } = api.config;
    const htmlData = api.appData.exportHtmlData;
    const htmlFiles: { path: string; content: string }[] = [];
    const { markupArgs: defaultMarkupArgs } = opts;

    for (const { file, route, prerender } of htmlData) {
      let markupArgs = defaultMarkupArgs;

      let routerBaseStr = JSON.stringify(base || '/');
      let publicPathStr = JSON.stringify(publicPath || '/');
      // handle relative publicPath, such as `./`, same with dynamicRoot
      if (publicPath.startsWith('.') || dynamicRoot) {
        assert(
          api.config.runtimePublicPath,
          '`runtimePublicPath` should be enable when `publicPath` is relative or `exportStatic.dynamicRoot` is true!',
        );

        let pathS = route.path;
        const isSlash = pathS.endsWith('/');
        if (pathS === '/404') {
          //do nothing
        }
        // keep the relative path same for route /xxx and /xxx.html
        else if (htmlSuffix && isSlash) {
          pathS = pathS.slice(0, -1);
        }
        // keep the relative path same for route /xxx/ and /xxx/index.html
        else if (!htmlSuffix && !isSlash) {
          pathS = pathS + '/';
        }

        const pathN = Math.max(pathS.split('/').length - 1, 1);
        routerBaseStr = `location.pathname.split('/').slice(0, -${pathN}).concat('').join('/')`;
        publicPathStr = `location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase`;

        const rltPrefix = relative(dirname(file), '.');
        const joinRltPrefix = (path: string) => {
          if (!rltPrefix || rltPrefix == '.') {
            return `.${path.startsWith('/') ? '' : '/'}${path}`;
          }
          return winPath(join(rltPrefix, path));
        };
        // prefix for all assets
        // HINT: clone for keep original markupArgs unmodified
        const picked = lodash.cloneDeep(
          lodash.pick(markupArgs, [
            'favicons',
            'links',
            'styles',
            'headScripts',
            'scripts',
          ]),
        );

        // handle favicons
        picked.favicons.forEach((item: string, i: number) => {
          if (item.startsWith(publicPath)) {
            picked.favicons[i] = joinRltPrefix(item);
          }
        });

        // handle links
        picked.links.forEach((link: { href: string }) => {
          if (link.href?.startsWith(publicPath)) {
            link.href = joinRltPrefix(link.href);
          }
        });

        // handle scripts
        [picked.headScripts, picked.scripts, picked.styles].forEach(
          (group: ({ src: string } | string)[]) => {
            group.forEach((script, i) => {
              if (typeof script === 'string' && script.startsWith(publicPath)) {
                group[i] = joinRltPrefix(script);
              } else if (
                typeof script === 'object' &&
                script.src?.startsWith(publicPath)
              ) {
                script.src = joinRltPrefix(script.src);
              }
            });
          },
        );

        picked.headScripts.unshift(
          `window.routerBase = ${routerBaseStr};`,
          `
if(!window.publicPath) {
window.publicPath = ${publicPathStr};
}
          `,
        );

        // update markupArgs
        markupArgs = Object.assign({}, markupArgs, picked);
      }

      // append html file
      const htmlContent = await getMarkup({
        ...markupArgs,
        // https://github.com/umijs/umi/issues/12108
        path: route.path,
      });

      htmlFiles.push({
        path: file,
        content:
          api.config.ssr && prerender
            ? await getPreRenderedHTML(api, htmlContent, route.path)
            : htmlContent,
      });
    }

    return htmlFiles;
  });

  api.onGenerateFiles(async () => {
    const {
      exportStatic: { extraRoutePaths = [], htmlSuffix },
    } = api.config;
    const extraHtmlData = getExportHtmlData(
      await getRoutesFromUserExtraPaths(extraRoutePaths),
      htmlSuffix,
    );
    const htmlData = getExportHtmlData(api.appData.routes, htmlSuffix).concat(
      extraHtmlData,
    );

    api.appData.exportHtmlData = htmlData;

    api.writeTmpFile({
      path: 'core/exportStaticRuntimePlugin.ts',
      content: Mustache.render(
        `
export function modifyClientRenderOpts(memo: any) {
  const { history, hydrate } = memo;

  return {
    ...memo,
    hydrate: hydrate && !{{{ ignorePaths }}}.includes(history.location.pathname),
  };
}

export function modifyContextOpts(memo: any) {
  return {
    ...memo,
    basename: window.routerBase || memo.basename,
  }
}
      `.trim(),
        {
          ignorePaths: JSON.stringify(
            htmlData
              .filter(({ prerender }) => prerender === false)
              .map(({ route }) => route.path),
          ),
        },
      ),
      noPluginDir: true,
    });
  });
  api.modifyRoutes((routes: Record<string, IRoute>) => {
    const {
      exportStatic: { htmlSuffix },
    } = api.config;
    // copy / to /index.html and /xxx to /xxx.html or /xxx/index.html
    for (let key of Object.keys(routes)) {
      const route = routes[key];
      if (isHtmlRoute(route)) {
        key = `${key}.html`;
        routes[key] = {
          ...route,
          path: getHtmlPath(route.path, htmlSuffix),
        };
      }
    }
  });
  api.addRuntimePlugin(() => {
    return [`@@/core/exportStaticRuntimePlugin.ts`];
  });
};
