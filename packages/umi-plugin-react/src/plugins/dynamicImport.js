import { join } from 'path';
import isReactComponent from '../utils/isReactComponent';
import isRelativePath from '../utils/isRelativePath';

export default function(api, options) {
  const { paths, winPath } = api;

  if (options.level) {
    process.env.CODE_SPLITTING_LEVEL = options.level;
  }

  api.modifyAFWebpackOpts(opts => {
    return {
      ...opts,
      disableDynamicImport: false,
    };
  });

  api.modifyRouteComponent((memo, args) => {
    const { importPath, webpackChunkName } = args;

    let loadingOpts = '';
    if (options.loadingComponent) {
      if (isReactComponent(options.loadingComponent.trim())) {
        loadingOpts = `, loading: ${options.loadingComponent.trim()}`;
      } else if (isRelativePath(options.loadingComponent.trim())) {
        loadingOpts = `, loading: require('${winPath(
          join(paths.absSrcPath, options.loadingComponent),
        )}').default`;
      } else {
        loadingOpts = `, loading: require('${options.loadingComponent.trim()}').default`;        
      }
    }

    let extendStr = '';
    if (options.webpackChunkName) {
      extendStr = `/* webpackChunkName: ^${webpackChunkName}^ */`;
    }
    return `dynamic({ loader: () => import(${extendStr}'${importPath}')${loadingOpts} })`;
  });
}
