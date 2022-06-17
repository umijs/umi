import { join } from 'path';
import { IApi } from '../../types';

/** esbuild plugin for resolving umi imports */
export function esbuildUmiPlugin(api: IApi) {
  return {
    name: 'umi',
    setup(build: any) {
      build.onResolve(
        { filter: /^(umi|@umijs\/max|@alipay\/bigfish)$/ },
        () => ({
          path: join(api.paths.absTmpPath, 'exports.ts'),
        }),
      );
    },
  };
}

export function absServerBuildPath(api: IApi) {
  if (api.env === 'development') {
    return join(api.paths.absTmpPath, 'server/umi.server.js');
  }
  return join(
    api.paths.cwd,
    api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
  );
}
