import { join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { getRouteComponents, getRoutes } from './routes';

export default (api: IApi) => {
  api.describe({
    key: 'tmpFiles',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });

  api.onGenerateFiles(async (opts) => {
    // umi.ts
    api.writeTmpFile({
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        rendererPath: require.resolve('@umijs/renderer-react'),
      },
    });

    // routes.ts
    let routes;
    if (opts.isFirstTime) {
      routes = api.appData.routes;
    } else {
      routes = await getRoutes({
        config: api.config,
        absSrcPage: api.paths.absSrcPath,
        absPagesPath: api.paths.absPagesPath,
      });
    }
    const hasSrc = api.appData.hasSrcDir;
    // @/pages/
    const prefix = hasSrc ? '../../src/pages/' : '../../pages/';
    api.writeTmpFile({
      path: 'core/routes.ts',
      tplPath: join(TEMPLATES_DIR, 'routes.tpl'),
      context: {
        routes: JSON.stringify(routes),
        routeComponents: await getRouteComponents({ routes, prefix }),
      },
    });
  });
};
