import { IApi } from '../../types';
import { lazyImportFromCurrentPkg } from '../../utils/lazyImportFromCurrentPkg';

const bundlerWebpack: typeof import('@umijs/bundler-webpack') =
  lazyImportFromCurrentPkg('@umijs/bundler-webpack');
const bundlerVite: typeof import('@umijs/bundler-vite') =
  lazyImportFromCurrentPkg('@umijs/bundler-vite');

export default (api: IApi) => {
  api.describe({
    // Don't occupy proprietary terms
    key: 'preset-umi:bundler',
  });

  api.modifyUniBundler((_, { bundler }) => {
    if (bundler === 'mako') {
      require('@umijs/bundler-webpack/dist/requireHook');
      // @ts-ignore
      return require(process.env.OKAM);
    }

    if (bundler === 'utoopack') {
      require('@umijs/bundler-webpack/dist/requireHook');
      // @ts-ignore
      return require(process.env.UTOOPACK);
    }

    if (bundler === 'vite') {
      return bundlerVite;
    }

    return bundlerWebpack;
  });
};
