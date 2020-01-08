import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi, IConfig } from '@umijs/types';
import { Route } from '@umijs/routes';
import { winPath } from '@umijs/utils';

export default function(api: IApi) {
  const {
    utils: { Mustache },
    paths,
    env,
  } = api;

  api.onGenerateFiles(async args => {
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    const route = new Route();
    const routes = route.getRoutes({
      config: api.config as IConfig,
      root: paths.absPagesPath,
    });
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: route.getJSON({ routes }),
        runtimePath: winPath(require.resolve('@umijs/runtime')),
        aliasedTmpPath: paths.aliasedTmpPath,
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['routes'],
      source: `${paths.aliasedTmpPath}/core/routes`,
    };
  });
}
