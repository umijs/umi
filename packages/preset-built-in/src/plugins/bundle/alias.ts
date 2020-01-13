import { IApi } from '@umijs/types';
import { join, dirname } from 'path';
import { winPath } from '@umijs/utils';

export default (api: IApi) => {
  const { paths, pkg, cwd } = api;

  function getUserLibDir({ library }: { library: string }) {
    if (
      (pkg.dependencies && pkg.dependencies[library]) ||
      (pkg.devDependencies && pkg.devDependencies[library])
    ) {
      return winPath(join(cwd, 'node_modules', library));
    }
    return null;
  }

  api.describe({
    key: 'alias',
    config: {
      schema(joi) {
        return joi.object().pattern(/.+/, joi.string());
      },
      default: {
        react:
          getUserLibDir({ library: 'react' }) ||
          dirname(require.resolve('react/package.json')),
        'react-dom':
          getUserLibDir({ library: 'react-dom' }) ||
          dirname(require.resolve('react-dom/package.json')),
        '@': paths.absSrcPath,
      },
    },
  });
};
