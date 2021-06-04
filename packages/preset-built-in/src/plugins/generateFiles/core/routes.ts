import { Route } from '@umijs/core';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { extname, join } from 'path';
import { runtimePath } from '../constants';

const ROUTE_FILE_EXT_LIST = ['.js', '.jsx', '.tsx'];

export default function (api: IApi) {
  const {
    cwd,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async (args) => {
    if (
      // conventional routes
      !api.config.routes &&
      // from watch
      args.files.length &&
      // no files is valid route component
      !args.files.some(({ path }) => {
        return (
          path.startsWith(api.paths.absPagesPath!) &&
          ROUTE_FILE_EXT_LIST.includes(extname(path))
        );
      })
    ) {
      return;
    }

    api.logger.debug('generate core/routes.ts');
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    const routes = await api.getRoutes();
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: new Route().getJSON({ routes, config: api.config, cwd }),
        runtimePath,
        config: api.config,
        loadingComponent:
          api.config.dynamicImport &&
          api.config.dynamicImport.loading &&
          winPath(api.config.dynamicImport.loading),
      }),
    });
  });

  // 这个加进去会导致 patchRoutes 在最初就执行，但期望的是在 render 后执行
  // 所以先不加
  // api.addUmiExports(() => {
  //   return {
  //     specifiers: ['routes'],
  //     source: `./routes`,
  //   };
  // });
}
