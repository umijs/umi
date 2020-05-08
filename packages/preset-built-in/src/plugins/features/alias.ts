import { IApi } from '@umijs/types';
import { dirname } from 'path';
import { winPath, resolve } from '@umijs/utils';

export default (api: IApi) => {
  const { paths, pkg, cwd } = api;
  const pathsAliasMapping = {
    '@': 'absSrcPath',
    '@@': 'absTmpPath',
  };
  // 基于 alias 和 paths 的映射关系生成默认的 alias
  const pathsRelatedAlias = Object.entries(pathsAliasMapping).reduce(
    (result, [name, key]) => ({
      ...result,
      [name]: paths[key],
    }),
  );

  api.describe({
    key: 'alias',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {
        'react-router': dirname(require.resolve('react-router/package.json')),
        'react-router-dom': dirname(
          require.resolve('react-router-dom/package.json'),
        ),
        // 替换成带 query 的 history
        // 由于用了 query-string，会额外引入 7.6K（压缩后，gzip 前），考虑换轻量的实现
        history: dirname(require.resolve('history-with-query/package.json')),
        // 将于 paths 对象的字段关联的 alias 展开
        ...pathsRelatedAlias,
      },
    },
  });

  function getUserLibDir({ library }: { library: string }) {
    if (
      (pkg.dependencies && pkg.dependencies[library]) ||
      (pkg.devDependencies && pkg.devDependencies[library]) ||
      // egg project using `clientDependencies` in ali tnpm
      (pkg.clientDependencies && pkg.clientDependencies[library])
    ) {
      return winPath(
        dirname(
          // 通过 resolve 往上找，可支持 lerna 仓库
          // lerna 仓库如果用 yarn workspace 的依赖不一定在 node_modules，可能被提到根目录，并且没有 link
          resolve.sync(`${library}/package.json`, {
            basedir: cwd,
          }),
        ),
      );
    }
    return null;
  }

  // 另一种实现方式:
  // 提供 projectFirstLibraries 的配置方式，但是不通用，先放插件层实现
  api.chainWebpack(async memo => {
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
    libraries.forEach(library => {
      memo.resolve.alias.set(
        library.name,
        getUserLibDir({ library: library.name }) || library.path,
      );
    });

    // 遍历与 paths 对象相关的 alias 映射，用于在使用 modifyPaths API 修改 paths 后更新 alias
    Object.entries(pathsAliasMapping).forEach(([name, key]) => {
      if (
        // 如果最新的 paths 对象中的值不等于初始化时的 alias 值（即 alias 过期了）
        pathsRelatedAlias[name] !== paths[key] &&
        // 并且当前 alias 配置项中的值仍然等于初始化时的 alias 值（即用户没有修改过）则对 alias 进行更新
        memo.resolve.alias.get(name) === pathsRelatedAlias[name]
      ) {
        memo.resolve.alias.set(name, paths[key]);
      }
    });

    return memo;
  });
};
