import { getSchemas } from '@umijs/bundler-webpack/dist/schema';
import { resolve } from '@umijs/utils';
import { dirname } from 'path';
import { IApi } from '../../types';
import { getSchemas as getExtraSchemas } from './schema';

function resolveProjectDep(opts: { pkg: any; cwd: string; dep: string }) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package`, {
        basedir: opts.cwd,
      }),
    );
  }
}

export default (api: IApi) => {
  const configDefaults: Record<string, any> = {
    alias: {
      umi: process.env.UMI_DIR!,
      '@umijs/renderer-react': dirname(
        require.resolve('@umijs/renderer-react/package.json'),
      ),
      react:
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react',
        }) || dirname(require.resolve('react/package.json')),
      'react-dom':
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react-dom',
        }) || dirname(require.resolve('react-dom/package.json')),
      'react-router': dirname(require.resolve('react-router/package.json')),
      'react-router-dom': dirname(
        require.resolve('react-router-dom/package.json'),
      ),
    },
    externals: {},
    autoCSSModules: true,
    publicPath: '/',
  };

  const bundleSchemas = getSchemas();
  const extraSchemas = getExtraSchemas();
  const schemas = {
    ...bundleSchemas,
    ...extraSchemas,
  };
  for (const key of Object.keys(schemas)) {
    const config: Record<string, any> = {
      schema: schemas[key] || ((joi: any) => joi.any()),
    };
    if (key in configDefaults) {
      config.default = configDefaults[key];
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
  api.chainWebpack((memo) => {
    memo.resolve.alias.set('@', api.paths.absSrcPath);
    memo.resolve.alias.set('@@', api.paths.absTmpPath);
  });
};
