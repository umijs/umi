import { fsExtra } from '@umijs/utils';
import { forEach } from '@umijs/utils/compiled/lodash';
import { existsSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
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
  const manifestPath = join(api.paths.cwd, 'server', 'build-manifest.json');
  if (api.userConfig.ssr.serverBuildPath || !existsSync(manifestPath)) {
    return join(
      api.paths.cwd,
      api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
    );
  }

  // server output path will not be removed before compile
  // so remove require cache to avoid outdated asset path when enable hash
  delete require.cache[manifestPath];
  const manifest = require(manifestPath);
  // basename use to strip public path
  // ex. /foo/umi.xxx.js -> umi.xxx.js
  return join(api.paths.cwd, 'server', basename(manifest.assets['umi.js']));
}

export const generateBuildManifest = (api: IApi) => {
  const publicPath = api.userConfig.publicPath || '/';
  const manifestFileName =
    api.config.manifest?.fileName || 'asset-manifest.json';
  const finalJsonObj: any = {};
  const assetFilePath = join(api.paths.absOutputPath, manifestFileName);
  const buildFilePath = join(api.paths.absOutputPath, 'build-manifest.json');
  const json = existsSync(assetFilePath)
    ? fsExtra.readJSONSync(assetFilePath)
    : {};
  forEach(json, (path, key) => {
    json[key] = `${publicPath}${path}`;
  });
  finalJsonObj.assets = json;
  writeFileSync(buildFilePath, JSON.stringify(finalJsonObj, null, 2), {
    flag: 'w',
  });
};
