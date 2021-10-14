import { join } from 'path';
import { TEMPLATES_DIR } from '../constants';
import { IApi } from '../types';
import { getRouteComponents, getRoutes } from './routes';

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    // umi.ts
    api.writeTmpFile({
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        rendererPath: require.resolve('@umijs/renderer-react'),
      },
    });

    // routes.ts
    const routes = await getRoutes({
      base: api.paths.absPagesPath,
    });
    const hasSrc = api.paths.absSrcPath.endsWith('/src');
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
