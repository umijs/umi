import { chalk, fsExtra, installWithNpmClient, semver } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  const bundlerWebpackPkg = require('@umijs/bundler-webpack/package.json');

  api.onStart(() => {
    // TODO: 支持在上层框架锁定，比如通过 api.appData.depsOnDemand 添加可选依赖
    const hasSwcConfig =
      api.config.srcTranspiler === 'swc' || api.config.depTranspiler === 'swc';

    const swcDeps: IInstallDep[] = [
      {
        name: '@swc/core',
        version: `^${bundlerWebpackPkg.devDependencies['@swc/core']}`,
      },
      {
        name: 'swc-plugin-auto-css-modules',
        version: `^${bundlerWebpackPkg.devDependencies['swc-plugin-auto-css-modules']}`,
      },
    ];

    const { missingDeps } = checkDeps({
      deps: swcDeps,
    });

    if (hasSwcConfig && missingDeps.length) {
      api.logger.info(
        `Since swc is used, install swc dependencies ${missingDeps
          .map(({ name }) => chalk.green(name))
          .join(', ')} on demand.`,
      );
      addDeps({
        pkgPath: api.pkgPath || join(api.cwd, 'package.json'),
        deps: missingDeps,
      });
      installWithNpmClient({
        npmClient: api.appData.npmClient,
        cwd: api.cwd,
      });
    }
  });

  function checkDeps(opts: { deps: IInstallDep[] }): {
    missingDeps: IInstallDep[];
  } {
    const missingDeps: IInstallDep[] = [];
    const { deps } = opts;
    deps.forEach((dep) => {
      const { name } = dep;
      const installed =
        api.pkg.dependencies?.[name] || api.pkg.devDependencies?.[name];
      if (!installed) {
        missingDeps.push(dep);
      } else {
        // dep outdated
        const userVersion = semver.minVersion(installed);
        const isOutdated = !userVersion || semver.ltr(userVersion, dep.version);
        if (isOutdated) {
          missingDeps.push(dep);
        }
      }
    });
    return {
      missingDeps,
    };
  }
};

interface IInstallDep {
  name: string;
  version: string;
}

function addDeps(opts: { pkgPath: string; deps: IInstallDep[] }) {
  const pkg = existsSync(opts.pkgPath)
    ? fsExtra.readJSONSync(opts.pkgPath)
    : {};
  pkg.devDependencies = pkg.devDependencies || {};
  opts.deps.forEach((dep) => {
    pkg.devDependencies[dep.name] = dep.version;
  });
  fsExtra.writeJSONSync(opts.pkgPath, pkg, { spaces: 2 });
}
