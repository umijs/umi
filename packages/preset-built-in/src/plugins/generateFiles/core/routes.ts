import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { Route } from '@umijs/routes';

export default function(api: IApi) {
  const {
    utils: { Mustache },
    paths,
  } = api;

  api.onGenerateFiles(async args => {
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    const route = new Route();
    const routes = route.getRoutes({
      config: api.config as object,
      root: paths.absPagesPath,
    });
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: route.getJSON({ routes }),
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['routes'],
      source: '@/.umi/core/routes',
    };
  });
}
