import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi, IConfig } from '@umijs/types';
import { Route } from '@umijs/core';
import { winPath } from '@umijs/utils';

export default function(api: IApi) {
  const {
    utils: { Mustache },
    paths,
    env,
  } = api;

  api.onGenerateFiles(async args => {
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    const routes = await api.applyPlugins({
      key: 'modifyRoutes',
      type: api.ApplyPluginsType.modify,
      initialValue: await api.getRoutes(),
    });
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: new Route().getJSON({ routes, config: api.config }),
        runtimePath: winPath(require.resolve('@umijs/runtime')),
      }),
    });
  });

  // 这个加进去会导致 patchRoutes 在最初就执行，先不加
  // api.addUmiExports(() => {
  //   return {
  //     specifiers: ['routes'],
  //     source: `./routes`,
  //   };
  // });
}
