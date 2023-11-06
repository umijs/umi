import {
  chalk,
  fsExtra,
  installWithNpmClient,
  lodash,
  logger,
  semver,
} from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export interface IOnDemandInstallDep {
  name: string;
  version: string;
  reason?: string;
  /**
   * install dev dep by default
   * @default true
   */
  dev?: boolean;
}

interface IInstallDep extends IOnDemandInstallDep {
  outdated?: boolean;
}

export default (api: IApi) => {
  api.onStart(async () => {
    const deps: IOnDemandInstallDep[] = lodash.uniqBy(
      await api.applyPlugins({
        key: 'addOnDemandDeps',
        initialValue: [],
      }),
      (dep) => {
        return dep.name;
      },
    );

    const { missingDeps } = checkDeps({ deps });

    if (missingDeps.length) {
      const hasReason = missingDeps.some((dep) => dep.reason);
      const loggerText = [
        `Install dependencies ${missingDeps
          .map(({ name }) => chalk.green(name))
          .join(', ')} on demand.`,
        ...(hasReason
          ? [
              `        ${chalk.bold.bgBlue(' REASONS ')}`,
              ...missingDeps
                .filter((dep) => dep.reason)
                .map(
                  (dep) =>
                    `         · ${chalk.cyan(dep.name)}${
                      dep.outdated ? chalk.gray('(outdated)') : ''
                    }: ${dep.reason}`,
                ),
            ]
          : []),
      ].join('\n');
      logger.info(loggerText);
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

  function checkDeps(opts: { deps: IOnDemandInstallDep[] }) {
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
          missingDeps.push({
            ...dep,
            outdated: true,
          });
        }
      }
    });
    return {
      missingDeps,
    };
  }
};

export function addDeps(opts: {
  pkgPath: string;
  deps: IOnDemandInstallDep[];
}) {
  const { pkgPath, deps } = opts;
  const pkg = existsSync(pkgPath) ? fsExtra.readJSONSync(pkgPath) : {};
  const [devDependencies, dependencies] = [
    deps.filter((dep) => dep.dev !== false),
    deps.filter((dep) => dep.dev === false),
  ];
  if (devDependencies.length) {
    pkg.devDependencies ||= {};
    devDependencies.forEach((dep) => {
      pkg.devDependencies[dep.name] = dep.version;
    });
  }
  if (dependencies.length) {
    pkg.dependencies ||= {};
    dependencies.forEach((dep) => {
      pkg.dependencies[dep.name] = dep.version;
    });
  }
  fsExtra.writeFileSync(
    opts.pkgPath,
    `${JSON.stringify(pkg, null, 2)}\n`,
    'utf-8',
  );
}
