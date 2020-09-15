import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { Route } from '@umijs/core';
import { runtimePath } from '../constants';

export default function (api: IApi) {
  const {
    cwd,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async (args) => {
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    const routes = await api.getRoutes();
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: new Route().getJSON({ routes, config: api.config, cwd }),
        runtimePath,
        config: api.config,
        loadingComponent: api.config.dynamicImport?.loading,
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
