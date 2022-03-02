import { fsExtra, installWithNpmClient } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onStart(() => {
    // TODO: 支持在上层框架锁定，比如通过 api.appData.depsOnDemand 添加可选依赖
    const hasSwcConfig =
      api.config.srcTranspiler === 'swc' || api.config.depTranspiler === 'swc';
    const swcInstalled =
      api.pkg.dependencies?.['@swc/core'] ||
      api.pkg.devDependencies?.['@swc/core'];
    if (hasSwcConfig && !swcInstalled) {
      api.logger.info('Since swc is used, install @swc/core on demand.');
      addDeps({
        pkgPath: api.pkgPath || join(api.cwd, 'package.json'),
        name: '@swc/core',
        version: `^${
          require('@umijs/bundler-webpack/package.json').devDependencies[
            '@swc/core'
          ]
        }`,
      });
      installWithNpmClient({
        npmClient: api.appData.npmClient,
        cwd: api.cwd,
      });
    }
  });
};

function addDeps(opts: { pkgPath: string; name: string; version: string }) {
  const pkg = existsSync(opts.pkgPath)
    ? fsExtra.readJSONSync(opts.pkgPath)
    : {};
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies[opts.name] = opts.version;
  fsExtra.writeJSONSync(opts.pkgPath, pkg, { spaces: 2 });
}
