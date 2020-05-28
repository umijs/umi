import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi, IConfig } from '@umijs/types';
import { Route } from '@umijs/core';
import { winPath } from '@umijs/utils';

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
        runtimePath: winPath(
          dirname(require.resolve('@umijs/runtime/package.json')),
        ),
        config: api.config,
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
