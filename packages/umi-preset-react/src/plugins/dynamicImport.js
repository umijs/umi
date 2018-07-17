import { join } from 'path';
import { winPath } from 'umi-utils';

export default function(api, options) {
  const { paths } = api.service;

  if (process.env.NODE_ENV === 'production') {
    api.register('modifyAFWebpackOpts', ({ memo }) => {
      return {
        ...memo,
        disableDynamicImport: false,
      };
    });

    api.register('modifyRouteComponent', ({ args }) => {
      const { webpackChunkName, importPath } = args;

      let loadingOpts = '';
      if (options.loadingComponent) {
        loadingOpts = ` loading: require('${winPath(
          join(paths.absSrcPath, options.loadingComponent),
        )}').default `;
      }

      let extendStr = '';
      if (options.webpackChunkName) {
        extendStr = `/* webpackChunkName: ^${webpackChunkName}^ */`;
      }
      return `dynamic(() => import(${extendStr}'${importPath}'), {${loadingOpts}})`;
    });
  }
}
