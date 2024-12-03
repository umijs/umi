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

/**
 * get export html data from routes
 */
function getExportHtmlData(routes: Record<string, IRoute>): IExportHtmlItem[] {
  const map = new Map<string, IExportHtmlItem>();

  Object.values(routes).forEach((route) => {
    const is404 = route.absPath === '/*';

    if (
      // skip layout
      !route.isLayout &&
      // skip dynamic route for win, because `:` is not allowed in file name
      (!IS_WIN || !route.path.includes('/:')) &&
      // skip `*` route, because `*` is not working for most site serve services
      (!route.path.includes('*') ||
        // except `404.html`
        is404)
    ) {
      const file = is404 ? '404.html' : join('.', route.absPath, 'index.html');

      map.set(file, {
        route: {
          path: is404 ? '/404' : route.absPath,
          redirect: route.redirect,
        },
        prerender: route.prerender !== false,
        file,
      });
    }
  });

  return Array.from(map.values());
}

/**
 * get pre-rendered html by route path
 */
async function getPreRenderedHTML(api: IApi, htmlTpl: string, path: string) {
  const {
    exportStatic: { ignorePreRenderError = false },
    base,
  } = api.config;

  await import(absServerBuildPath(api)).then(
    (res) => (markupRender ??= res.default._markupGenerator),
  );

  try {
    const location = `${base.endsWith('/') ? base.slice(0, -1) : base}${path}`;
    const html = await markupRender(location);
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
    const { publicPath } = api.config;
    const htmlData = api.appData.exportHtmlData;
    const htmlFiles: { path: string; content: string }[] = [];
    const { markupArgs: defaultMarkupArgs } = opts;

    for (const { file, route, prerender } of htmlData) {
      let markupArgs = defaultMarkupArgs;

      // handle relative publicPath, such as `./`
      if (publicPath.startsWith('.')) {
        assert(
          api.config.runtimePublicPath,
          '`runtimePublicPath` should be enable when `publicPath` is relative!',
        );

        const rltPrefix = relative(dirname(file), '.');

        // prefix for all assets
        if (rltPrefix) {
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
              picked.favicons[i] = winPath(join(rltPrefix, item));
            }
          });

          // handle links
          picked.links.forEach((link: { href: string }) => {
            if (link.href?.startsWith(publicPath)) {
              link.href = winPath(join(rltPrefix, link.href));
            }
          });

          // handle scripts
          [picked.headScripts, picked.scripts, picked.styles].forEach(
            (group: ({ src: string } | string)[]) => {
              group.forEach((script, i) => {
                if (
                  typeof script === 'string' &&
                  script.startsWith(publicPath)
                ) {
                  group[i] = winPath(join(rltPrefix, script));
                } else if (
                  typeof script === 'object' &&
                  script.src?.startsWith(publicPath)
                ) {
                  script.src = winPath(join(rltPrefix, script.src));
                }
              });
            },
          );

          // update markupArgs
          markupArgs = Object.assign({}, markupArgs, picked);
        }
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
      exportStatic: { extraRoutePaths = [] },
    } = api.config;
    const extraHtmlData = getExportHtmlData(
      await getRoutesFromUserExtraPaths(extraRoutePaths),
    );
    const htmlData = getExportHtmlData(api.appData.routes).concat(
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

  api.addRuntimePlugin(() => {
    return [`@@/core/exportStaticRuntimePlugin.ts`];
  });
};
