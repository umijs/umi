import { dirname, join, relative } from 'path';
import { getMarkup } from '@umijs/server';
import type { IApi, IRoute } from '../../types';
import { lodash, winPath } from '@umijs/utils';
import assert from 'assert';

const IS_WIN = process.platform === 'win32';

interface IExportHtmlItem {
  route: {
    path: string;
    redirect?: string;
  };
  file: string;
}

/**
 * get export html data from routes
 */
function getExportHtmlData(routes: Record<string, IRoute>): IExportHtmlItem[] {
  const map = new Map<string, IExportHtmlItem>();

  Object.values(routes).forEach((route) => {
    if (
      // skip layout
      !route.isLayout &&
      // skip dynamic route for win, because `:` is not allowed in file name
      (!IS_WIN || !route.path.includes('/:')) &&
      // skip `*` route, because `*` is not working for most site serve services
      (!route.path.includes('*') ||
        // except `404.html`
        route.absPath === '/*')
    ) {
      const file =
        route.absPath === '/*'
          ? '404.html'
          : join('.', route.absPath, 'index.html');

      map.set(file, {
        route: {
          path: route.absPath,
          redirect: route.redirect,
        },
        file,
      });
    }
  });

  return Array.from(map.values());
}

export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.object(),
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheck(() => {
    assert(!api.config.mpa, '`exportStatic` is not supported in `mpa` mode.');
  });

  // export routes to html files
  api.modifyExportHTMLFiles(async (_defaultFiles, opts) => {
    const { publicPath } = api.config;
    const htmlData = getExportHtmlData(api.appData.routes);
    const htmlFiles: { path: string; content: string }[] = [];

    for (const { file } of htmlData) {
      let { markupArgs } = opts;

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
          const picked = lodash.clone(
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
      htmlFiles.push({ path: file, content: await getMarkup(markupArgs) });
    }

    return htmlFiles;
  });
};
