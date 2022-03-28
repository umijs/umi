import { importLazy } from '@umijs/utils';
import { dirname } from 'path';

/**
 * lazy require dep from current package position (preset-umi)
 */
export const lazyImportFromCurrentPkg = (depName: string) => {
  return importLazy(dirname(require.resolve(`${depName}/package.json`)));
};
