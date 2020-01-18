import { IApi } from '@umijs/types';
import { join, dirname } from 'path';
import { winPath } from '@umijs/utils';

export default (api: IApi) => {
  const { paths, pkg, cwd } = api;

  api.describe({
    key: 'alias',
    config: {
      schema(joi) {
        return joi.object().pattern(/.+/, joi.string());
      },
      default: {
        'react-router': dirname(require.resolve('react-router/package.json')),
        'react-router-dom': dirname(
          require.resolve('react-router-dom/package.json'),
        ),
        '@': paths.absSrcPath,
        '@@': paths.absTmpPath,
      },
    },
  });

  function getUserLibDir({ library }: { library: string }) {
    if (
      (pkg.dependencies && pkg.dependencies[library]) ||
      (pkg.devDependencies && pkg.devDependencies[library])
    ) {
      return winPath(join(cwd, 'node_modules', library));
    }
    return null;
  }

  // 另一种实现方式:
  // 提供 projectFirstLibraries 的配置方式，但是不通用，先放插件层实现
  api.modifyBundleConfig(async (bundleConfig, { bundler }) => {
    if (bundler.id === 'webpack') {
      const libraries: {
        name: string;
        path: string;
      }[] = await api.applyPlugins({
        key: 'addProjectFirstLibraries',
        type: api.ApplyPluginsType.add,
        initialValue: [
          {
            name: 'react',
            path: dirname(require.resolve(`react/package.json`)),
          },
          {
            name: 'react-dom',
            path: dirname(require.resolve(`react-dom/package.json`)),
          },
        ],
      });
      const libraryAlias = libraries.reduce((memo, library) => {
        memo[library.name] =
          getUserLibDir({ library: library.name }) || library.path;
        return memo;
      }, {});
      bundleConfig.resolve!.alias = {
        ...bundleConfig.resolve!.alias,
        ...libraryAlias,
      };
    }
    return bundleConfig;
  });
};
