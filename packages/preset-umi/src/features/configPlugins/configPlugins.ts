import { getSchemas as getViteSchemas } from '@umijs/bundler-vite/dist/schema';
import { getSchemas as getWebpackSchemas } from '@umijs/bundler-webpack/dist/schema';
import { dirname, join } from 'path';
import type { IApi } from '../../types';
import { resolveProjectDep } from '../../utils/resolveProjectDep';
import { getSchemas as getExtraSchemas } from './schema';

export default (api: IApi) => {
  const { userConfig } = api;
  const reactDOMPath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'react-dom',
    }) || dirname(require.resolve('react-dom/package.json'));
  const isLT18 = (() => {
    const reactDOMVersion = require(join(reactDOMPath, 'package.json')).version;
    const majorVersion = parseInt(reactDOMVersion.split('.')[0], 10);
    return majorVersion < 18;
  })();
  const configDefaults: Record<string, any> = {
    alias: {
      umi: '@@/exports',
      react:
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react',
        }) || dirname(require.resolve('react/package.json')),
      ...(isLT18
        ? {
            'react-dom/client': reactDOMPath,
          }
        : {}),
      'react-dom': reactDOMPath,
      // mpa don't need to use react-router
      ...(userConfig.mpa
        ? {}
        : {
            'react-router': dirname(
              require.resolve('react-router/package.json'),
            ),
            'react-router-dom': dirname(
              require.resolve('react-router-dom/package.json'),
            ),
          }),
    },
    externals: {
      // Keep the `react-dom/client` external consistent with the `react-dom` external when react < 18.
      // Otherwise, `react-dom/client` will still bundled in the outputs.
      ...(isLT18 && userConfig.externals?.['react-dom']
        ? {
            'react-dom/client': userConfig.externals['react-dom'],
          }
        : {}),
    },
    autoCSSModules: true,
    publicPath: '/',
    mountElementId: 'root',
    base: '/',
    history: { type: 'browser' },
    svgr: {},
    ignoreMomentLocale: true,
    mfsu: { strategy: 'eager' },
    routeLoader: { moduleType: 'esm' },
  };

  const bundleSchemas = api.config.vite
    ? getViteSchemas()
    : getWebpackSchemas();
  const extraSchemas = getExtraSchemas();
  const schemas = {
    ...bundleSchemas,
    ...extraSchemas,
  };
  for (const key of Object.keys(schemas)) {
    const config: Record<string, any> = {
      schema: schemas[key] || ((Joi: any) => Joi.any()),
    };
    if (key in configDefaults) {
      config.default = configDefaults[key];
    }

    // when routes change, not need restart server
    // routes data will auto update in `onGenerateFiles` (../tmpFiles/tmpFiles.ts)
    if (['routes'].includes(key)) {
      config.onChange = api.ConfigChangeType.regenerateTmpFiles;
    }

    api.registerPlugins([
      {
        id: `virtual: config-${key}`,
        key: key,
        config,
      },
    ]);
  }

  // api.paths is ready after register
  api.modifyConfig((memo, args) => {
    memo.alias = {
      ...memo.alias,
      '@': args.paths.absSrcPath,
      '@@': args.paths.absTmpPath,
    };
    return memo;
  });
};
