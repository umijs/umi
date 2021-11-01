import { existsSync } from 'fs';
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

    // route.ts
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
      path: 'core/route.ts',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        routes: JSON.stringify(routes),
        routeComponents: await getRouteComponents({ routes, prefix }),
      },
    });

    // plugin.ts
    const plugins: string[] = await api.applyPlugins({
      key: 'addRuntimePlugin',
      initialValue: [
        // TODO: add tryFiles in @umijs/utils
        existsSync(join(api.paths.absSrcPath, 'app.ts')) &&
          join(api.paths.absSrcPath, 'app.ts'),
        existsSync(join(api.paths.absSrcPath, 'app.tsx')) &&
          join(api.paths.absSrcPath, 'app.tsx'),
        existsSync(join(api.paths.absSrcPath, 'app.jsx')) &&
          join(api.paths.absSrcPath, 'app.jsx'),
        existsSync(join(api.paths.absSrcPath, 'app.js')) &&
          join(api.paths.absSrcPath, 'app.js'),
      ]
        .filter(Boolean)
        .slice(0, 1),
    });
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      initialValue: [
        // TODO: support these methods
        // 'modifyClientRenderOpts',
        // 'patchRoutes',
        'rootContainer',
        // 'render',
        // 'onRouteChange',
      ],
    });
    api.writeTmpFile({
      path: 'core/plugin.ts',
      tplPath: join(TEMPLATES_DIR, 'plugin.tpl'),
      context: {
        plugins: plugins.map((plugin, index) => ({ index, path: plugin })),
        validKeys: validKeys,
      },
    });
  });
};
